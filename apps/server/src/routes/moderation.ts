import Elysia, { t } from 'elysia';
import { authMiddleware } from '~/middleware/auth.middleware';
import { broadcastChatMessage, disconnectChatSocketsForUser } from '~/util/chatSessions';
import { toClientMessage } from '~/schemas/messages.schema';
import { MAX_MESSAGE_LENGTH } from '#config';
import { ErrorSchema, RequestResultSchema } from '~/schemas/generic.schema';
import { moderation, users, messages } from '~/db/actions';
import { ModerationUserSchema, UserPermissionsSchema, type ModerationUser, type UserPermissions } from '~/schemas/moderation.schema';
import { type ModerationUserRow } from '~/db/actions/moderation.actions';
import { mapObject } from '~/util/mapObject';
import { Value } from '@sinclair/typebox/value';
import { getLogger } from '@logtape/logtape';

// Inherits the sink and level configured for the parent ['rabbitclub'] category.
// HTTP request context supplies requestId automatically.
const logger = getLogger(['rabbitclub', 'moderation']);

// To create fallback permissions object when db row is empty
// NOTE, ONE WARNING: this constructor defaults to `false` (irregardless of db default)
// if any permission becomes a default true, you'll need to ensure theres a db row for
// everyone instead of using this, or come up with some hacky override.
// TODO -- CONSIDER CHANGING THIS
export const createUserPermissions = (): UserPermissions =>
    Value.Create(UserPermissionsSchema);

const toModerationUser = (
    target: ModerationUserRow
): ModerationUser => ({
    ...target,
    permissions: mapObject(
        target.permissions ?? createUserPermissions(),
        permission => target.is_admin || permission
    )
});

export const moderationRoutes = new Elysia({ prefix: '/moderation' })
    .use(authMiddleware)
    .get('/permissions', ({ user }) => {
        const dbPermissions =
            moderation.getUserPermissions(user.id);

        const permissions =
            dbPermissions ?? createUserPermissions();

        return mapObject(
            permissions,
            permission => user.is_admin || permission
        );
    }, {
        useAuth: true,
        response: {
            200: UserPermissionsSchema
        }
    })
    .get('/users', () => moderation.listModerationUsers()
        .map(toModerationUser), {
        usePermission: 'can_ban_users',
        response: {
            200: t.Array(ModerationUserSchema)
        }
    })
    .get('/user/:id', ({ params, status }) => {
        const targetId = Number(params.id);
        if (!targetId) return status(400, { message: 'Invalid target user' });

        const target = moderation.getModerationUser(targetId);
        if (!target) return status(404, { message: 'User not found' });

        return toModerationUser(target);
    }, {
        usePermission: 'can_ban_users',
        response: {
            200: ModerationUserSchema,
            400: ErrorSchema,
            404: ErrorSchema
        }
    })
    .post('/user/:id/ban', ({ params, user, body, status }) => {
        const targetId = Number(params.id);
        if (!targetId) return status(400, { message: 'Invalid target user' });

        const target = users.getUserById(targetId);
        if (!target) return status(404, { message: 'User not found' });
        if (target.is_banned) return status(409, { message: 'User is already banned' });

        // admins can never be banned
        if (target.is_admin) return status(422, { message: 'admins cannot be banned' });

        // these users cannot be banned, unless by an admin
        if (!user.is_admin) {
            const targetPermissions = moderation.getUserPermissions(target.id);
            if (targetPermissions?.can_ban_users) return status(422, { message: 'cannot ban another moderator with ban permissions' });
        }

        const banned = moderation.banUser(targetId, user.id, body?.reason);
        if (!banned) return status(500, { message: 'Unable to ban user' });

        const disconnectedSockets = disconnectChatSocketsForUser(targetId, 4003, 'account_banned');
        logger.info('User {targetUserId} banned by {actorUserId}; disconnected {disconnectedSockets} sockets', {
            action: 'user_banned',
            actorUserId: user.id,
            targetUserId: targetId,
            disconnectedSockets
        });
        return { success: true };
    }, {
        usePermission: 'can_ban_users',
        body: t.Optional(t.Object({
            reason: t.Optional(t.String({ maxLength: MAX_MESSAGE_LENGTH }))
        })),
        response: {
            200: RequestResultSchema,
            400: ErrorSchema,
            404: ErrorSchema,
            409: ErrorSchema,
            422: ErrorSchema,
            500: ErrorSchema
        }
    })
    .post('/user/:id/unban', ({ params, user, body, status }) => {
        const targetId = Number(params.id);
        if (!targetId) return status(400, { message: 'Invalid target user' });

        const target = users.getUserById(targetId);
        if (!target) return status(404, { message: 'User not found' });
        if (!target.is_banned) return status(409, { message: 'User is not banned' });

        const restored = moderation.unbanUser(targetId, user.id, body?.reason);
        if (!restored) return status(500, { message: 'Unable to unban user' });

        logger.info('User {targetUserId} unbanned by {actorUserId}', {
            action: 'user_unbanned',
            actorUserId: user.id,
            targetUserId: targetId
        });

        return { success: true };
    }, {
        usePermission: 'can_ban_users',
        body: t.Optional(t.Object({
            reason: t.Optional(t.String({ maxLength: MAX_MESSAGE_LENGTH }))
        })),
        response: {
            200: RequestResultSchema,
            400: ErrorSchema,
            404: ErrorSchema,
            409: ErrorSchema,
            500: ErrorSchema
        }
    })
    .delete('/messages/:id', ({ params, user, body, status }) => {
        const deleted = messages.deleteMessage(Number(params.id), user.id, 'moderator', body?.reason);
        if (!deleted) return status(404, { message: 'Message not found' });

        logger.info('Message {messageId} deleted by moderator {actorUserId}', {
            action: 'message_deleted',
            actorUserId: user.id,
            messageId: deleted.id,
            targetUserId: deleted.user_id
        });

        broadcastChatMessage(toClientMessage(deleted));
        return { success: true };
    }, {
        usePermission: 'can_delete_messages',
        body: t.Optional(t.Object({ reason: t.Optional(t.String({ maxLength: MAX_MESSAGE_LENGTH })) })),
        response: {
            200: RequestResultSchema,
            404: ErrorSchema
        }
    })
    .patch('/messages/:id', ({ params, user, body, status }) => {
        const targetId = Number(params.id);
        if (!targetId) return status(400, { message: 'invalid target message' });
        const updated = messages.setModerationNote(targetId, user.id, body.note ?? null);
        if (!updated) return status(404, { message: 'Message not found' });

        logger.info('Moderation note for message {messageId} updated by {actorUserId}', {
            action: 'moderation_note_updated',
            actorUserId: user.id,
            messageId: updated.id,
            targetUserId: updated.user_id,
            noteCleared: body.note == null
        });

        broadcastChatMessage(toClientMessage(updated));
        return { success: true };
    }, {
        usePermission: 'can_leave_notes',
        body: t.Object({
            note: t.Optional(t.String({ maxLength: MAX_MESSAGE_LENGTH }))
        }),
        response: {
            200: RequestResultSchema,
            404: ErrorSchema,
            400: ErrorSchema
        }
    });

import Elysia, { t } from 'elysia';
import { authMiddleware } from '~/middleware/auth.middleware';
import { broadcastChatMessage, disconnectChatSocketsForUser } from '~/util/chatSessions';
import { toClientMessage } from '~/schemas/messages.schema';
import { MAX_MESSAGE_LENGTH } from '#config';
import { ErrorSchema, RequestResultSchema } from '~/schemas/generic.schema';
import { actions } from '~/db/actions';
import { type ModerationUserRow, ModerationUserSchema, UserPermissionsSchema, type ModerationUser, type UserPermissions } from '~/schemas/moderation.schema';
import { mapObject } from '~/util/mapObject';
import { Value } from '@sinclair/typebox/value';

// To create fallback permissions object when db row is empty
// NOTE, ONE WARNING: this constructor defaults to `false` (irregardless of db default)
// if any permission becomes a default true, you'll need to ensure theres a db row for
// everyone instead of using this, or come up with some hacky override.
export const createUserPermissions = (): UserPermissions =>
    Value.Create(UserPermissionsSchema);

const toModerationUser = (target: ModerationUserRow): ModerationUser => ({
    id:       target.id,
    username: target.username,
    is_admin: target.is_admin,
    permissions: mapObject(
        target.permissions ?? createUserPermissions(),
        permission => target.is_admin || permission
    ),
    is_banned: target.is_banned
});

export const moderationRoutes = new Elysia({ prefix: '/moderation' })
    .use(authMiddleware)
    .get('/permissions', ({ user }) => {
        const dbPermissions =
            actions.moderation.getUserPermissions(user.id);

        const { user_id: _userId, ...permissions } =
            dbPermissions ?? {
                user_id: user.id,
                ...createUserPermissions()
            };

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
    .get('/users', () => actions.moderation.listUsersWithPermissions()
        .map(toModerationUser), {
        usePermission: 'can_ban_users',
        response: {
            200: t.Array(ModerationUserSchema)
        }
    })
    .get('/user/:id', ({ params, status }) => {
        const targetId = Number(params.id);
        if (!targetId) return status(400, { message: 'Invalid target user' });

        const target = actions.moderation.getUserWithPermissions(targetId);
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

        const target = actions.users.getUserById(targetId);
        if (!target) return status(404, { message: 'User not found' });
        if (target.is_banned) return status(409, { message: 'User is already banned' });

        // admins can never be banned
        if(target.is_admin) return status(422, { message: 'admins cannot be banned' });

        // these users cannot be banned, unless by an admin
        if(!user.is_admin) {
            const targetPermissions = actions.moderation.getUserPermissions(target.id);
            if(targetPermissions?.can_ban_users) return status(422, { message: 'cannot ban another moderator with ban permissions' });
        }

        const banned = actions.moderation.banUser(targetId, user.id, body?.reason);
        if (!banned) return status(500, { message: 'Unable to ban user' });

        disconnectChatSocketsForUser(targetId, 4003, 'account_banned');
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
    .delete('/messages/:id', ({ params, user, body, status }) => {
        const deleted = actions.messages.deleteMessage(Number(params.id), user.id, 'moderator', body?.reason);
        if (!deleted) return status(404, { message: 'Message not found' });

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
        const updated = actions.messages.setModerationNote(targetId, user.id, body.note ?? null);
        if (!updated) return status(404, { message: 'Message not found' });

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

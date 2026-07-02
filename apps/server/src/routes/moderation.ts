import Elysia, { t } from "elysia";
import { authMiddleware } from "~/middleware/auth.middleware";
import { broadcastChatMessage } from "~/util/chatSessions";
import { toClientMessage } from "~/schemas/messages.schema";
import { MAX_MESSAGE_LENGTH } from "#config";
import { ErrorSchema } from "~/schemas/generic.schema";
import { actions } from "~/db/actions";
import { UserPermissionsSchema } from "~/schemas/moderation.schema";

export const moderationRoutes = new Elysia({ prefix: '/moderation' })
    .use(authMiddleware)
    .get("/permissions", ({ user }) => {
        const perms = actions.getUserPermissions(user.id)
        const grant = (val?: number | null) => user.is_admin === 1 || Boolean(val)

        return {
            can_ban_users: grant(perms?.can_ban_users),
            can_delete_messages: grant(perms?.can_delete_messages),
            can_leave_notes: grant(perms?.can_leave_notes),
            can_manage_invites: grant(perms?.can_manage_invites),
        }
    }, {
        useAuth: true,
        response: {
            200: UserPermissionsSchema
        }
    })
    .delete("/messages/:id", ({ params, user, body, status }) => {
        const deleted = actions.deleteMessage(Number(params.id), user.id, body?.reason)
        if (!deleted) return status(404, { message: "Message not found" })

        broadcastChatMessage(toClientMessage(deleted));
        return { success: true }
    }, {
        usePermission: 'can_delete_messages',
        body: t.Optional(t.Object({ reason: t.Optional(t.String({ maxLength: MAX_MESSAGE_LENGTH })) })),
        response: {
            200: t.Object({ success: t.Boolean() }),
            404: ErrorSchema
        }
    })
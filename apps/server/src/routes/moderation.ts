import Elysia, { t } from "elysia";
import { authMiddleware } from "~/middleware/auth.middleware";
import { broadcastChatMessage } from "~/util/chatSessions";
import { toClientMessage } from "~/schemas/messages.schema";
import { MAX_MESSAGE_LENGTH } from "#config";
import { ErrorSchema } from "~/schemas/generic.schema";
import { actions } from "~/db";

export const moderationRoutes = new Elysia({ prefix: '/moderation' })
    .use(authMiddleware)
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
import Elysia, { t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { actions } from "../db";
import { ErrorSchema } from "~/schemas/generic.schema";
import { AuthorizationErrorSchema } from "~/schemas/auth.schema";
import { broadcastChatMessage } from "~/util/chatSessions";
import { toClientMessage } from "~/schemas/messages.schema";

export const adminRoutes = new Elysia({prefix: '/admin'})
    .use(authMiddleware)
    .post("/invite", ({body, user, status}) => {
        const existingCode = actions.getInviteCode(body.code);
        if(existingCode) return status(409, {message: "code already exists"});

        const invite = actions.insertInviteCode(body.code, user.id);
        if (!invite) return status(500, {message: "unable to create invite"});

        return {code: invite.code}
    }, {
        useAdmin: true,
        body: t.Object({
            code: t.String()
        }),
        response: {
            403: AuthorizationErrorSchema,
            409: ErrorSchema,
            500: ErrorSchema
        }
    })
    .delete("/messages/:id", ({ params, user, body, status }) => {
        const deleted = actions.deleteMessage(Number(params.id), user.id, body?.reason)
        if (!deleted) return status(404, { message: "Message not found" })

        broadcastChatMessage(toClientMessage(deleted));
        return { success: true }
    }, {
        usePermission: 'can_delete_messages',
        body: t.Optional(t.Object({ reason: t.Optional(t.String()) })),
        response: {
            200: t.Object({ success: t.Boolean() }),
            404: ErrorSchema
        }
    })

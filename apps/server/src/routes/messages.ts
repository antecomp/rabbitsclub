import Elysia, { t } from "elysia";
import { actions } from "~/db/actions";
import { authMiddleware } from "~/middleware/auth.middleware";
import { ErrorSchema, RequestResultSchema } from "~/schemas/generic.schema";
import { ClientMessageSchema, toClientMessage } from "~/schemas/messages.schema";
import { broadcastChatMessage } from "~/util/chatSessions";

export const messageRoutes = new Elysia()
    .use(authMiddleware)
    .get("/messages", ({ query }) =>
        actions.getRecent(
            query.before ? Number(query.before) : undefined,
            query.limit ? Number(query.limit) : undefined
        ).map(toClientMessage), {
        // Invokes auth middlware.
        useAuth: true,
        response: {
            200: t.Array(ClientMessageSchema),
        },
        query: t.Object({
            before: t.Optional(t.String()),
            limit: t.Optional(t.String())
        })
    })
    .delete("/messages/:id", ({ params: { id }, status, user: requester }) => {
        const targetMessageID = Number(id);

        // NaN and 0 invalid.
        if (!targetMessageID) return status(400, { message: "Malformed/Invalid Message ID" });

        const targetMessage = actions.getMessageByID(targetMessageID);

        if (!targetMessage) return status(404, { message: "Message not found" });
        if (targetMessage.user_id !== requester.id) return status(403, {message: "User does not own message"});
        if (targetMessage.deleted_at) return status(409, { message: "Message already deleted" });

        const deleted = actions.deleteMessage(targetMessageID, requester.id, 'user');
        if(!deleted) return status(500, {message: "Unable to delete message"});

        broadcastChatMessage(toClientMessage(deleted));
        return {success: true};

    }, {
        useAuth: true,
        response: {
            200: RequestResultSchema,
            400: ErrorSchema,
            403: ErrorSchema,
            404: ErrorSchema,
            409: ErrorSchema,
            500: ErrorSchema
        }
    })
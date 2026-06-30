import { Elysia, t } from "elysia";
import { actions } from "../db";
import { MessageSchema, SentMessageSchema, SystemEvents, WSMessageSchema } from "../schemas/messages.schema";
import { authMiddleware } from "../middleware/auth.middleware";
import { CHAT_WS_NAME } from "../config";
import { registerChatSocket, unregisterChatSocket } from "../util/chatSessions";
import { MAX_MESSAGE_LENGTH } from "#config";

const onlineUsers = new Map<number, { username: string, count: number }>();
const getOnlineUsers = () => Array.from(onlineUsers.values()).map(u => u.username);
const PublicMessageSchema = t.Object({
    id: t.Number(),
    username: t.String(),
    content: t.String(),
    deleted: t.Boolean(),
    deleted_reason: t.Union([t.String(), t.Null()]),
    created_at: t.String()
});

const publicMessage = ({
    deleted_at,
    deleted_by,
    admin_note,
    admin_note_by,
    admin_note_at,
    deleted_reason,
    content,
    ...message
}: typeof MessageSchema.static) => {
    const deleted = deleted_at !== null;

    return {
        ...message,
        content: deleted ? "" : content,
        deleted,
        deleted_reason: deleted ? deleted_reason : null
    };
};

export const chatRoutes = new Elysia()
    .use(authMiddleware)
    .get("/messages", ({query}) => actions.getRecent(
        query.before ? Number(query.before) : undefined,
        query.limit ? Number(query.limit) : undefined
    ).map(publicMessage), {
        // Invokes auth middlware.
        useAuth: true,
        response: {
            200: t.Array(PublicMessageSchema),
        },
        query: t.Object({
            before: t.Optional(t.String()),
            limit: t.Optional(t.String())
        })
    })
    .ws("/ws", {
        // invokes auth middleware, provides us with "user" JWT payload too!
        useAuth: true,
        body: SentMessageSchema,
        response: WSMessageSchema,
        open(ws) {
            const { id, username } = ws.data.user;
            const current = onlineUsers.get(id);

            registerChatSocket(id, ws, ws.data.authSession.exp);
            ws.subscribe(CHAT_WS_NAME);

            if (current) {
                current.count++
            } else {
                onlineUsers.set(id, { username, count: 1 });
                ws.publish(CHAT_WS_NAME, { type: 'system', event: SystemEvents.USER_JOINED, content: username })
                ws.send({ type: 'system', event: SystemEvents.USER_JOINED, content: username })
                ws.publish(CHAT_WS_NAME, { type: 'online', users: getOnlineUsers() })
            }

            // Send current online list to the newly connected client
            ws.send({ type: 'online', users: getOnlineUsers() })
        },
        message(ws, message) {
            // silently fail for now.
            if(message.content.length > MAX_MESSAGE_LENGTH) return;
            const msgContent = message.content.trim();
            if(!msgContent) return;
            const saved = actions.insertMessage(ws.data.user.username, msgContent);
            if (!saved) {
                console.error("Unable to post message to DB", message);
                return;
            }
            ws.publish(CHAT_WS_NAME, { ...saved, type: 'user' }); // broadcasts to everyone but the sender
            ws.send({ ...saved, type: 'user' }); // echos back to sender.
        },
        close(ws) {
            const { id, username } = ws.data.user;
            unregisterChatSocket(id, ws);
            const current = onlineUsers.get(id);
            if (!current) return;

            current.count--;
            if (current.count === 0) {
                onlineUsers.delete(id);
                ws.publish(CHAT_WS_NAME, { type: "system", event: SystemEvents.USER_LEFT, content: username });
                ws.publish(CHAT_WS_NAME, { type: 'online', users: getOnlineUsers() })
            }

            ws.unsubscribe(CHAT_WS_NAME);
        }
    })

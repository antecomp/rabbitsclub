import { Elysia, t } from "elysia";
import { actions } from "../db";
import { MessageSchema, SentMessageSchema, WSMessageSchema } from "../schemas/messages.schema";
import { authMiddleware } from "../middleware/auth.middleware";
import { CHAT_WS_NAME } from "../config";

const onlineUsers = new Map<number, { username: string, count: number }>();
const getOnlineUsers = () => Array.from(onlineUsers.values()).map(u => u.username);

export const chatRoutes = new Elysia()
    .use(authMiddleware)
    .get("/messages", () => actions.getRecent(), {
        // Invokes auth middlware.
        useAuth: true,
        response: {
            200: t.Array(MessageSchema),
            //401: ErrorSchema
        }
    })
    .ws("/ws", {
        // invokes auth middleware, provides us with "user" JWT payload too!
        useAuth: true,
        body: SentMessageSchema,
        response: WSMessageSchema,
        open(ws) {
            const { id, username } = ws.data.user;
            const current = onlineUsers.get(id);

            ws.subscribe(CHAT_WS_NAME);

            if (current) {
                current.count++
            } else {
                onlineUsers.set(id, { username, count: 1 });
                ws.publish(CHAT_WS_NAME, { type: 'system', content: `${username} is now online` })
                ws.publish(CHAT_WS_NAME, { type: 'online', users: getOnlineUsers() })
            }

            // Send current online list to the newly connected client
            ws.send({ type: 'online', users: getOnlineUsers() })
        },
        message(ws, message) {
            const saved = actions.insertMessage(ws.data.user.username, message.content);
            if (!saved) {
                console.error("Unable to post message to DB", message);
                return;
            }
            ws.publish(CHAT_WS_NAME, { ...saved, type: 'user' }); // broadcasts to everyone but the sender
            ws.send({ ...saved, type: 'user' }); // echos back to sender.
        },
        close(ws) {
            const { id, username } = ws.data.user;
            const current = onlineUsers.get(id);
            if (!current) return;

            current.count--;
            if (current.count === 0) {
                onlineUsers.delete(id);
                ws.publish(CHAT_WS_NAME, { type: "system", content: `${username} has left` });
                ws.publish(CHAT_WS_NAME, { type: 'online', users: getOnlineUsers() })
            }

            ws.unsubscribe(CHAT_WS_NAME);
        }
    })

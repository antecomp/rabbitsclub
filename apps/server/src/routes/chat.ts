import { Elysia, t } from "elysia";
import { actions } from "../db";
import { MessageSchema, SentMessageSchema } from "../schemas/messages.schema";
import jwt from "@elysiajs/jwt";
import { AuthCookieSchema, ErrorSchema, JWTSchema } from "../schemas/users.schema";
import { authMiddleware } from "../middleware/auth.middleware";

export const chatRoutes = new Elysia()
    .use(authMiddleware)
    .get("/messages", () => actions.getRecent(), {
        // Invokes auth middlware.
        auth: true,
        response: {
            200: t.Array(MessageSchema),
            //401: ErrorSchema
        }
    })
    .ws("/ws", {
        auth: true,
        body: SentMessageSchema,
        response: MessageSchema,
        open(ws) {
            ws.subscribe("chat");
        },
        message(ws, message) {
            const saved = actions.insertMessage(ws.data.user.username, message.content);
            if(!saved) {
                console.error("Unable to post message to DB", message);
                return;
            }
            ws.publish("chat", saved); // broadcasts to everyone but the sender
            ws.send(saved); // echos back to sender.
        },
        close(ws) {
            ws.unsubscribe("chat");
        }
    })
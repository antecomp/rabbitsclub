import { Elysia, t } from "elysia";
import { actions } from "../db";
import { MessageSchema, SentMessageSchema, WSMessageSchema } from "../schemas/messages.schema";
import jwt from "@elysiajs/jwt";
import { AuthCookieSchema, ErrorSchema, JWTSchema } from "../schemas/users.schema";
import { authMiddleware } from "../middleware/auth.middleware";

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
            ws.subscribe("chat");
        },
        message(ws, message) {
            const saved = actions.insertMessage(ws.data.user.username, message.content);
            if(!saved) {
                console.error("Unable to post message to DB", message);
                return;
            }
            ws.publish("chat", {...saved, type: 'user'}); // broadcasts to everyone but the sender
            ws.send({...saved, type: 'user'}); // echos back to sender.
        },
        close(ws) {
            ws.unsubscribe("chat");
        }
    })
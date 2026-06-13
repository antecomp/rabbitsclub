import { Elysia, t } from "elysia";
import { actions } from "../db";
import { MessageSchema, SentMessageSchema } from "../schemas/messages.schema";
import jwt from "@elysiajs/jwt";
import { AuthCookieSchema, ErrorSchema, type JWTPayload } from "../schemas/users.schema";
import { verifyAuth } from "../middleware/auth.middleware";

export const chatRoutes = new Elysia()
    .use(jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!
    }))
    // .get("/messages", async ({ jwt, cookie, set }) => {
    //     const payload = await jwt.verify(cookie.auth.value) as JWTPayload | false
    //     if (!payload) {
    //         set.status = 401
    //         return { message: "Unauthorized" }
    //     }
    //     return actions.getRecent()
    // }, {
    //     cookie: AuthCookieSchema,
    //     response: {
    //         200: t.Array(MessageSchema),
    //         401: ErrorSchema
    //     }
    // })
    .get("/messages", async ({ jwt, cookie, set }) => {
        const user = await verifyAuth(jwt, cookie.auth)
        if (!user) {
            set.status = 401
            return { message: "Unauthorized" }
        }
        return actions.getRecent()
    }, {
        cookie: AuthCookieSchema
    })
    .ws("/ws", {
        // used to validate message shape
        body: SentMessageSchema,
        response: MessageSchema,
        cookie: AuthCookieSchema,
        async open(ws) {
            const payload = await ws.data.jwt.verify(ws.data.cookie.auth.value) as JWTPayload | false
            if (!payload) {
                ws.close()
                return
            }

            ws.subscribe("chat");
        },
        message(ws, message) {
            // TODO: auth messages or do we just rely on auth to connect to the socket?
            const saved = actions.insertMessage(message.username, message.content);
            if (!saved) {
                console.error("Unable to post message to DB");
                return;
            }
            ws.publish("chat", saved); // echos to other subscribers.
            ws.send(saved); // echos back to sender.
        },
        close(ws) {
            console.log("client disconnected:", ws.id);
            ws.unsubscribe("chat")
        }
    });
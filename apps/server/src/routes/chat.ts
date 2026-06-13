import { Elysia, t } from "elysia";
import { actions } from "../db";
import { MessageSchema, SentMessageSchema } from "../schemas/messages.schema";

export const chatRoutes = new Elysia()
    .get("/messages", () => actions.getRecent(), {
        response: t.Array(MessageSchema)
    })
    .ws("/ws", {
        // used to validate message shape
        body: SentMessageSchema,
        open(ws) {
            ws.subscribe("chat")
        },
        message(ws, message) {
            const saved = actions.insertMessage(message.username, message.content);
            ws.publish("chat", saved); // echos to other subscribers.
            ws.send(saved); // echos back to sender.
        },
        close(ws) {
            ws.unsubscribe("chat")
        }
    });
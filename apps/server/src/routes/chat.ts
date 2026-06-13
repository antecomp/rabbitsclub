import { Elysia, t } from "elysia";
import { actions } from "../db";
import { MessageSchema } from "../schemas/messages.schema";

export const chatRoutes = new Elysia()
    .get("/messages", () => actions.getRecent(), {
        response: t.Array(MessageSchema)
    })
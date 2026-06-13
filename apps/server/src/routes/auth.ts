import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { actions } from "../db"
import { AuthBodySchema, AuthResponseSchema, ErrorSchema } from "../schemas/users.schema"

export const authRoutes = new Elysia({ prefix: "/auth" })
    .use(jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!
    }))
    .post("/register", async ({ jwt, body, set }) => {
        const existing = actions.getUserByUsername(body.username);
        if (existing) {
            set.status = 409;
            return { message: "Username already taken" }
        }

        const hashed = await Bun.password.hash(body.password);
        const user = actions.insertUser(body.username, hashed);

        if (!user) {
            set.status = 500;
            return { message: "Failed to create user" }
        }

        const token = await jwt.sign({ id: user.id, username: user.username });
        return { token };
    }, {
        body: AuthBodySchema,
        response: {
            200: AuthResponseSchema,
            409: ErrorSchema,
            500: ErrorSchema
        }
    })
    .post("/login", async ({ jwt, body, set }) => {
        const user = actions.getUserByUsername(body.username);
        if (!user) {
            set.status = 401;
            return { message: "invalid credentials" }
        }

        const valid = await Bun.password.verify(body.password, user.password);
        if (!valid) {
            set.status = 401;
            return { message: "invalid credentials" }
        }

        const token = await jwt.sign({ id: user.id, username: user.username });
        return { token }
    }, {
        body: AuthBodySchema,
        response: {
            200: AuthResponseSchema,
            401: ErrorSchema
        }
    });
import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { actions } from "../db"
import { AuthBodySchema, AuthCookieSchema, AuthResponseSchema, ErrorSchema, type JWTPayload } from "../schemas/users.schema"

export const authRoutes = new Elysia({ prefix: "/auth" })
    .use(jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!
    }))
    .post("/register", async ({ jwt, body, set, cookie: { auth } }) => {
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

        const token = await jwt.sign({ id: user.id, username: user.username } satisfies JWTPayload);

        auth.set({
            value: token,
            httpOnly: true,
            secure: false, // set to true in prod (requires https)
            sameSite: "lax", // change to strict for stronger CSRF protection
            maxAge: 60 * 60 * 24 * 7 // 1 week.
        });

        return { success: true }
    }, {
        body: AuthBodySchema,
        response: {
            200: AuthResponseSchema,
            409: ErrorSchema,
            500: ErrorSchema
        },
        cookie: AuthCookieSchema
    })
    .post("/login", async ({ jwt, body, set, cookie: { auth } }) => {
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

        const token = await jwt.sign({ id: user.id, username: user.username } satisfies JWTPayload);

        auth.set({
            value: token,
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7
        });

        return { success: true }
    }, {
        body: AuthBodySchema,
        response: {
            200: AuthResponseSchema,
            401: ErrorSchema,
            422: ErrorSchema
        },
        cookie: AuthCookieSchema
    })
    .post("/logout", ({ cookie: { auth } }) => {
        // TODO: Blacklist token.
        auth.remove();
        return { success: true }
    }, {
        response: {
            200: AuthResponseSchema
        },
        cookie: AuthCookieSchema
    })
    .get("/me", async ({ jwt, set, cookie: { auth } }) => {
        const payload = await jwt.verify(auth.value) as JWTPayload | false;
        if(!payload) {
            set.status = 401
            return {message: "unauthorized"}
        }
        return {id: payload.id, username: payload.username}
    }, {
        response: {
            200: t.Object({id: t.Number(), username: t.String()}),
            401: ErrorSchema
        },
        cookie: AuthCookieSchema
    })
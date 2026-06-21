import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { actions } from "~/db"
import { LoginBodySchema, AuthCookieSchema, LoginResponseSchema, ErrorSchema, JWTSchema, RegisterBodySchema } from "../schemas/users.schema"
import { JWT_TOKEN_LIFESPAN } from "../config"

const cookieSameSite = (() => {
    const value = process.env.COOKIE_SAME_SITE
    if (value === "strict" || value === "lax" || value === "none") return value
    return "lax"
})()

const authCookieOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: cookieSameSite,
    maxAge: JWT_TOKEN_LIFESPAN
} as const

export const authRoutes = new Elysia({ prefix: "/auth" })
    .use(jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!,
        schema: JWTSchema
    }))
    .post("/register", async ({ jwt, body, cookie: { auth }, status }) => {
        const invite = actions.getInviteCode(body.code);
        if (!invite || invite.used_by !== null) 
            return status(403, { message: "Invalid or already used invite code" });

        const existing = actions.getUserByUsername(body.username);
        if (existing) 
            return status(409, { message: "Username already taken" });

        const hashed = await Bun.password.hash(body.password);
        const user = actions.insertUser(body.username, hashed);

        if (!user) 
            return status(500, { message: "Failed to create user" });

        actions.claimInviteCode(body.code, user.id);

        const token = await jwt.sign({ 
            id: user.id, 
            username: user.username, 
            exp: Math.floor(Date.now() / 1000) + JWT_TOKEN_LIFESPAN,
            is_admin: user.is_admin
        });
        auth.set({
            value: token,
            ...authCookieOptions
        });

        return { success: true }
    }, {
        body: RegisterBodySchema,
        response: {
            200: LoginResponseSchema,
            403: ErrorSchema,
            409: ErrorSchema,
            500: ErrorSchema
        },
        cookie: AuthCookieSchema
    })
    .post("/login", async ({ jwt, body, cookie: { auth }, status }) => {
        const user = actions.getUserByUsername(body.username);
        if (!user) return status(401, {message: "invalid credentials"});

        const valid = await Bun.password.verify(body.password, user.password);
        if (!valid) return status(401, {message: "invalid credentials"});

        const token = await jwt.sign({ 
            id: user.id, 
            username: user.username, 
            exp: Math.floor(Date.now() / 1000) + JWT_TOKEN_LIFESPAN,
            is_admin: user.is_admin
        });

        auth.set({
            value: token,
            ...authCookieOptions
        });

        return { success: true }
    }, {
        body: LoginBodySchema,
        response: {
            200: LoginResponseSchema,
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
            200: LoginResponseSchema
        },
        cookie: AuthCookieSchema
    })
    .get("/me", async ({ jwt, cookie: { auth }, status }) => {
        const payload = await jwt.verify(auth.value);
        if (!payload) return status(401, {message: "unauthenticated"});
        return { id: payload.id, username: payload.username, is_admin: payload.is_admin }
    }, {
        response: {
            200: t.Object({ id: t.Number(), username: t.String(), is_admin: t.Integer() }),
            401: ErrorSchema
        },
        cookie: AuthCookieSchema
    })

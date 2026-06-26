import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { actions } from "~/db"
import { LoginBodySchema, AuthCookieSchema, LoginResponseSchema, ErrorSchema, JWTSchema, RegisterBodySchema, InviteLookupResponseSchema } from "../schemas/users.schema"
import { clearAuthCookie, isAuthFailure, issueAuthCookie, validateAuthToken } from "../util/auth"

export const authRoutes = new Elysia({ prefix: "/auth" })
    .use(jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!,
        schema: JWTSchema
    }))
    .get("/invite/:code", ({ params, status }) => {
        const invite = actions.getAvailableInvite(params.code)
        if (!invite) {
            return status(404, { message: "Invalid or already used invite code" })
        }

        return invite
    }, {
        response: {
            200: InviteLookupResponseSchema,
            404: ErrorSchema
        }
    })
    .post("/register", async ({ jwt, body, cookie: { auth }, status }) => {
        const invite = actions.getInviteCode(body.code);
        if (!invite || invite.used_by !== null) 
            return status(403, { message: "Invalid or already used invite code" });

        const existing = actions.getUserByUsername(body.username);
        if (existing) 
            return status(409, { message: "Username already taken" });

        const hashed = await Bun.password.hash(body.password);
        let user;
        try {
            user = actions.insertUserWithInvite(body.username, hashed, body.code, body.avatar);
        } catch (error) {
            if (error instanceof Error && error.message === "INVITE_CLAIM_FAILED") {
                return status(403, { message: "Invalid or already used invite code" });
            }
            return status(500, { message: "Failed to create user" });
        }

        if (!user) 
            return status(500, { message: "Failed to create user" });

        await issueAuthCookie(user, auth, jwt);

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

        await issueAuthCookie(user, auth, jwt);

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
        clearAuthCookie(auth);
        return { success: true }
    }, {
        response: {
            200: LoginResponseSchema
        },
        cookie: AuthCookieSchema
    })
    .get("/me", async ({ jwt, cookie: { auth } }) => {
        if (!auth?.value) return null;

        const result = await validateAuthToken(jwt, auth.value);
        if (isAuthFailure(result)) return null;

        const { user } = result;
        return { id: user.id, username: user.username, is_admin: user.is_admin }
    }, {
        response: {
            200: t.Union([t.Object({ id: t.Number(), username: t.String(), is_admin: t.Integer() }), t.Null()]),
        },
        cookie: AuthCookieSchema
    })

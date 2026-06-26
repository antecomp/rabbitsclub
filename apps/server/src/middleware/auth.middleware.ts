import Elysia from "elysia"
import { jwt } from "@elysiajs/jwt"
import { AuthCookieSchema, JWTSchema } from "../schemas/users.schema"
import { isAuthFailure, validateAuthToken } from "../util/auth"

export const authMiddleware = new Elysia({ name: "auth-middleware" })
    .use(jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!,
        schema: JWTSchema
    }))
    .macro("useAuth", {
        cookie: AuthCookieSchema,
        async resolve({ jwt, cookie: { auth }, status }) {
            if (!auth?.value) return status(401, {message: "unauthenticated"});
            const result = await validateAuthToken(jwt, auth.value)
            if (isAuthFailure(result)) return status(401, {message: result.reason});
            return { user: result.user }
        }
    })
    .macro("useAdmin", {
        useAuth: true,
        resolve({user, status}) {
            if(!user.is_admin) return status(403, {message: "unauthenticated"})
        }
    })

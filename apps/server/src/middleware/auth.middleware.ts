import Elysia from "elysia"
import { jwt } from "@elysiajs/jwt"
import { AuthCookieSchema, JWTSchema } from "../schemas/auth.schema"
import { authError, authorizationError, clearAuthCookie, isAuthFailure, isOriginAllowed, validateAuthToken } from "../util/auth"

export const authMiddleware = new Elysia({ name: "auth-middleware" })
    .use(jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!,
        schema: JWTSchema
    }))
    .macro("useAuth", {
        cookie: AuthCookieSchema,
        async resolve({ request, jwt, cookie: { auth }, status }) {
            if (!isOriginAllowed(request)) return status(403, authError("origin_not_allowed"));
            if (!auth?.value) return status(401, authError("unauthenticated"));
            const result = await validateAuthToken(jwt, auth.value)
            if (isAuthFailure(result)) {
                clearAuthCookie(auth)
                return status(401, authError(result.reason));
            }
            return {
                user: result.user,
                authSession: {
                    exp: result.payload.exp
                }
            }
        }
    })
    .macro("useAdmin", {
        useAuth: true,
        resolve({user, status}) {
            if(!user.is_admin) return status(403, authorizationError("forbidden"))
        }
    })

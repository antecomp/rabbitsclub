import Elysia, { type Context } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { AuthCookieSchema, JWTSchema } from "../schemas/auth.schema"
import { authError, authorizationError, clearAuthCookie, isAuthFailure, isOriginAllowed, validateAuthToken } from "../util/auth"
import { actions } from "~/db"
import type { User } from "../schemas/users.schema"

// TODO: make this less cancerous
type UserPermission = Exclude<keyof NonNullable<ReturnType<typeof actions.getUserPermissions>>, "user_id">

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
    // Gross but I think there's a hole in Elysia typing right now that forces this method.
    .macro("usePermission", (permission: UserPermission) => ({
        useAuth: true,
        resolve(context) {
            // Elysia applies returned macro keys at runtime, but does not type them inside factory resolve.
            const { user } = context as unknown as Context & { user: User }
            const { status } = context

            if(user.is_admin) return; // admins bypass
            const perms = actions.getUserPermissions(user.id);
            if(!perms?.[permission]) return status(403, authorizationError("forbidden"))
        }
    } as const))

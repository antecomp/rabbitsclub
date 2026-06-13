// src/middleware/auth.middleware.ts
import Elysia from "elysia"
import { jwt } from "@elysiajs/jwt"
import { AuthCookieSchema, JWTSchema } from "../schemas/users.schema"

export const authMiddleware = new Elysia({ name: "auth-middleware" })
    .use(jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!,
        schema: JWTSchema
    }))
    .macro("useAuth", {
        cookie: AuthCookieSchema,
        async resolve({ jwt, cookie: { auth }, status }) {
            if (!auth?.value) return status(401)
            const payload = await jwt.verify(auth.value)
            if (!payload) return status(401)
            // This user value should now be accessable by users of the macro.
            return { user: payload }
        }
    })
import type { Cookie } from "elysia"
import { JWT_TOKEN_LIFESPAN } from "../config"
import { actions } from "../db"
import type { AuthJwtPayload, User } from "../schemas/users.schema"

const cookieSameSite = (() => {
    const value = process.env.COOKIE_SAME_SITE
    if (value === "strict" || value === "lax" || value === "none") return value
    return "lax"
})()

export const authCookieOptions = {
    httpOnly: true,
    path: "/",
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: cookieSameSite,
    maxAge: JWT_TOKEN_LIFESPAN
} as const

export type AuthFailureReason = "unauthenticated" | "session_expired" | "session_revoked"

export type AuthFailure = {
    reason: AuthFailureReason
}

export function isAuthFailure(result: { user: User } | AuthFailure): result is AuthFailure {
    return "reason" in result
}

type JwtService = {
    sign(payload: Omit<AuthJwtPayload, "iat"> & { iat: true }): Promise<string>
    verify(token: string): Promise<AuthJwtPayload | false>
}

type AuthCookie = Cookie<string | undefined>

export async function issueAuthCookie(user: User, authCookie: AuthCookie, jwt: JwtService) {
    const now = Math.floor(Date.now() / 1000)
    const token = await jwt.sign({
        id: user.id,
        username: user.username,
        is_admin: user.is_admin,
        ver: user.token_version,
        iat: true,
        exp: now + JWT_TOKEN_LIFESPAN
    })

    authCookie.set({
        value: token,
        ...authCookieOptions
    })
}

export function clearAuthCookie(authCookie: AuthCookie) {
    authCookie.remove()
}

export function revokeAllSessions(userId: number) {
    return actions.bumpTokenVersion(userId)
}

export async function validateAuthToken(jwt: JwtService, token: string): Promise<{ user: User } | AuthFailure> {
    const payload = await jwt.verify(token)
    if (!payload) return { reason: "unauthenticated" }

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp <= now) return { reason: "session_expired" }

    const user = actions.getUserById(payload.id)
    if (!user) return { reason: "session_revoked" }

    if (payload.ver !== user.token_version) return { reason: "session_revoked" }

    return { user }
}

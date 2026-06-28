import type { Cookie } from "elysia"
import { JWT_TOKEN_LIFESPAN } from "../config"
import { actions } from "../db"
import type { AuthErrorCode, AuthJwtPayload, AuthorizationErrorCode, User } from "../schemas/users.schema"

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

const enforceOriginCheck = process.env.AUTH_ENFORCE_ORIGIN_CHECK !== "false"

const allowedOrigins = new Set(
    (process.env.AUTH_ALLOWED_ORIGINS ?? process.env.CLIENT_ORIGIN ?? "")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean)
)

export type AuthFailure = {
    reason: AuthErrorCode
}

export type AuthSuccess = {
    user: User
    payload: AuthJwtPayload
}

export function isAuthFailure(result: AuthSuccess | AuthFailure): result is AuthFailure {
    return "reason" in result
}

export function authError(reason: AuthErrorCode) {
    return { message: reason, code: reason }
}

export function authorizationError(reason: AuthorizationErrorCode) {
    return { message: reason, code: reason }
}

export function isOriginAllowed(request: Request) {
    if (!enforceOriginCheck) return true

    const origin = request.headers.get("origin")
    if (!origin) return false

    return allowedOrigins.has(origin)
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
    authCookie.set({
        value: "",
        ...authCookieOptions,
        expires: new Date(0),
        maxAge: 0
    })
}

export function revokeAllSessions(userId: number) {
    return actions.bumpTokenVersion(userId)
}

export async function validateAuthToken(jwt: JwtService, token: string): Promise<AuthSuccess | AuthFailure> {
    const payload = await jwt.verify(token)
    if (!payload) return { reason: "unauthenticated" }

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp <= now) return { reason: "session_expired" }

    const user = actions.getUserById(payload.id)
    if (!user) return { reason: "session_revoked" }

    if (payload.ver !== user.token_version) return { reason: "session_revoked" }

    return { user, payload }
}

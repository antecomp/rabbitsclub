import { t } from "elysia"

export interface User {
    id: number
    username: string
    password: string
    created_at: string
}

export const UserSchema = t.Object({
    id: t.Number(),
    username: t.String(),
    password: t.String(),
    created_at: t.String()
})

export interface InviteCode {
    id: number,
    code: string,
    used_by: number | null,
    created_at: string
}

export const LoginBodySchema = t.Object({
    username: t.String({ minLength: 3 }),
    password: t.String({ minLength: 8 })
})

export const LoginResponseSchema = t.Object({
    success: t.Boolean()
})

export const RegisterBodySchema = t.Object({
    username: t.String({ minLength: 3 }),
    password: t.String({ minLength: 8 }),
    code: t.String({ minLength: 1 })
})

export const ErrorSchema = t.Object({
    message: t.String()
})

export const AuthCookieSchema = t.Object({
    auth: t.Optional(t.String())
})

export const JWTSchema = t.Object({
    id: t.Number(),
    username: t.String()
});
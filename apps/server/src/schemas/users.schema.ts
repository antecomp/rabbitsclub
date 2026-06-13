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

export const AuthBodySchema = t.Object({
    username: t.String({ minLength: 3 }),
    password: t.String({ minLength: 8 })
})

export const AuthResponseSchema = t.Object({
    token: t.String()
})

export const ErrorSchema = t.Object({
    message: t.String()
})
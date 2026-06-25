import { t } from "elysia"
import { model } from "../db/model"

// These replace your manual UserSchema, InviteCode interface etc.
export const UserSchema = t.Object(model.select.users)
export type User = typeof UserSchema['static']

export const InviteCodeSchema = t.Object(model.select.inviteCodes)
export type InviteCode = typeof InviteCodeSchema['static']

// These stay manual since they don't map directly to table shapes
export const LoginBodySchema = t.Object({
    username: t.String({ minLength: 3 }),
    password: t.String({ minLength: 8 })
})

export const RegisterBodySchema = t.Object({
    username: t.String({ minLength: 3 }),
    password: t.String({ minLength: 8 }),
    code: t.String({ minLength: 1 })
})

export const InviteLookupResponseSchema = t.Object({
    code: t.String(),
    invited_by_username: t.String()
})

export const LoginResponseSchema = t.Object({ success: t.Boolean() })
export const ErrorSchema = t.Object({ message: t.String() })
export const AuthCookieSchema = t.Object({ auth: t.Optional(t.String()) })
export const JWTSchema = t.Object({
    id: t.Number(),
    username: t.String(),
    is_admin: t.Number()
})

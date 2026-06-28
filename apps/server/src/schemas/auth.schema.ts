import { t } from "elysia"
import { AvatarDataSchema } from "./profiles.schema"

/** Request body schema for login requests. */
export const LoginBodySchema = t.Object({
    username: t.String({ minLength: 3 }),
    password: t.String({ minLength: 8 })
});

/** Request body schema for registration requests. */
export const RegisterBodySchema = t.Object({
    username: t.String({ minLength: 3 }),
    password: t.String({ minLength: 8 }),
    code: t.String({ minLength: 1 }),
    avatar: t.Optional(AvatarDataSchema)
});

/** Response schema for invite code lookup results. */
export const InviteLookupResponseSchema = t.Object({
    code: t.String(),
    invited_by_username: t.String()
});

/** Success response schema for login attempts. */
export const LoginResponseSchema = t.Object({ success: t.Boolean() });

/**
 * Allowed authentication error codes.
 * Extracted type: AuthErrorCode
 */
export const AuthErrorCodeSchema = t.Union([
    t.Literal("unauthenticated"),
    t.Literal("session_expired"),
    t.Literal("session_revoked"),
    t.Literal("origin_not_allowed")
]);

export type AuthErrorCode = typeof AuthErrorCodeSchema['static'];

/** Error payload schema for authentication failures. */
export const AuthErrorSchema = t.Object({
    message: t.String(),
    code: AuthErrorCodeSchema
});

/**
 * Authorization error codes.
 * Extracted type: AuthorizationErrorCode
 */
export const AuthorizationErrorCodeSchema = t.Literal("forbidden");
export type AuthorizationErrorCode = typeof AuthorizationErrorCodeSchema['static'];

/** Error payload schema for authorization failures. */
export const AuthorizationErrorSchema = t.Object({
    message: t.String(),
    code: AuthorizationErrorCodeSchema
});

/** Current user profile payload schema. */
export const CurrentUserSchema = t.Object({
    id: t.Number(),
    username: t.String(),
    is_admin: t.Integer()
});

/** Cookie schema for auth session storage. */
export const AuthCookieSchema = t.Object({ auth: t.Optional(t.String()) });

/**
 * JWT payload schema used for authentication tokens.
 * Extracted type: AuthJwtPayload
 */
export const JWTSchema = t.Object({
    id: t.Number(),
    username: t.String(),
    is_admin: t.Number(),
    ver: t.Number(),
    iat: t.Number(),
    exp: t.Number()
});

export type AuthJwtPayload = typeof JWTSchema['static'];

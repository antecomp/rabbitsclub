import { t } from "elysia"

/** Schema for the X/Y offset applied to an avatar eye.  */
export const EyeOffsetSchema = t.Object({
    x: t.Number(),
    y: t.Number()
});

/**
 * Schema for the avatar appearance data used during registration and profile handling.
 * Extracted type: AvatarData
 */
export const AvatarDataSchema = t.Object({
    head: t.Number(),
    leftEye: t.String(),
    rightEye: t.String(),
    leftEyeOffset: EyeOffsetSchema,
    rightEyeOffset: EyeOffsetSchema
});

export type AvatarData = typeof AvatarDataSchema['static'];
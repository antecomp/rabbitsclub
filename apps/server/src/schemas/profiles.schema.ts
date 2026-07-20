import { t } from "elysia"

/** Schema for the X/Y offset applied to a transformable avatar part. */
export const AvatarOffsetSchema = t.Object({
    x: t.Number(),
    y: t.Number()
});

export const EyeSlotSchema = t.Object({
    variant: t.String(),
    offset: AvatarOffsetSchema,
    rotation: t.Number()
});

export const AccessorySlotSchema = t.Object({
    variant: t.Union([t.String(), t.Null()]),
    offset: AvatarOffsetSchema,
    rotation: t.Number()
});

/**
 * Schema for the avatar appearance data used during registration and profile handling.
 * Extracted type: AvatarData
 */
export const AvatarDataSchema = t.Object({
    head: t.Number(),
    leftEye: EyeSlotSchema,
    rightEye: EyeSlotSchema,
    accessory1: AccessorySlotSchema,
    accessory2: AccessorySlotSchema
});

export type AvatarData = typeof AvatarDataSchema['static'];

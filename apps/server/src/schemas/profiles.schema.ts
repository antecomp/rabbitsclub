import { t } from "elysia"

export const EyeOffsetSchema = t.Object({
    x: t.Number(),
    y: t.Number()
})

export const AvatarDataSchema = t.Object({
    head: t.Number(),
    leftEye: t.String(),
    rightEye: t.String(),
    leftEyeOffset: EyeOffsetSchema,
    rightEyeOffset: EyeOffsetSchema
})

export type AvatarData = typeof AvatarDataSchema['static']
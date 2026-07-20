import type { AvatarData } from "~/schemas/profiles.schema"

type Offset = AvatarData["leftEye"]["offset"]
type EyeSlot = AvatarData["leftEye"]
type AccessorySlot = AvatarData["accessory1"]

function parseOffset(value: unknown): Offset | null {
    if (typeof value !== "object" || value === null) return null

    const record = value as Record<string, unknown>
    if (typeof record.x !== "number" || typeof record.y !== "number") return null

    return {
        x: record.x,
        y: record.y
    }
}

function parseEyeSlot(value: unknown): EyeSlot | null {
    if (typeof value !== "object" || value === null) return null

    const record = value as Record<string, unknown>
    const offset = parseOffset(record.offset)
    if (typeof record.variant !== "string" || !offset || typeof record.rotation !== "number") {
        return null
    }

    return {
        variant: record.variant,
        offset,
        rotation: record.rotation
    }
}

function createDefaultAccessorySlot(): AccessorySlot {
    return {
        variant: null,
        offset: { x: 0, y: 0 },
        rotation: 0
    }
}

function parseAccessorySlot(value: unknown): AccessorySlot {
    if (typeof value !== "object" || value === null) return createDefaultAccessorySlot()

    const record = value as Record<string, unknown>
    const offset = parseOffset(record.offset)
    const variant = record.variant
    if (!offset || (variant !== null && typeof variant !== "string") || typeof record.rotation !== "number") {
        return createDefaultAccessorySlot()
    }

    return {
        variant,
        offset,
        rotation: record.rotation
    }
}

export default function parseAvatarData(value: string | null): AvatarData | null {
    if (!value) return null

    try {
        const avatar = JSON.parse(value) as Record<string, unknown>
        const leftEye = parseEyeSlot(avatar.leftEye)
        const rightEye = parseEyeSlot(avatar.rightEye)

        if (typeof avatar.head !== "number" || !leftEye || !rightEye) return null

        return {
            head: avatar.head,
            leftEye,
            rightEye,
            accessory1: parseAccessorySlot(avatar.accessory1),
            accessory2: parseAccessorySlot(avatar.accessory2)
        }
    } catch {
        return null
    }
}

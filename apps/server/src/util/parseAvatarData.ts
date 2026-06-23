import type { AvatarData } from "~/schemas/profiles.schema"

export default function parseAvatarData(value: string | null): AvatarData | null {
    if (!value) return null

    try {
        const avatar = JSON.parse(value) as Partial<AvatarData>
        if (
            typeof avatar.head !== "number" ||
            typeof avatar.leftEye !== "string" ||
            typeof avatar.rightEye !== "string" ||
            typeof avatar.leftEyeOffset?.x !== "number" ||
            typeof avatar.leftEyeOffset?.y !== "number" ||
            typeof avatar.rightEyeOffset?.x !== "number" ||
            typeof avatar.rightEyeOffset?.y !== "number"
        ) {
            return null
        }

        return avatar as AvatarData
    } catch {
        return null
    }
}
import { AvatarData } from "./avatar.types";

// wrap in factory to prevent shallow copy / modification of same reference for offsets.
export function createDefaultAvatar(): AvatarData {
    return {
        head: 0,
        leftEye: 'bead',
        rightEye: 'bead',
        leftEyeOffset: { x: 0, y: 0 },
        rightEyeOffset: { x: 0, y: 0 }
    };
}

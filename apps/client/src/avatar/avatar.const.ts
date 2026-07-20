import { AvatarData } from "./avatar.types";

/**
 * Creates a fresh baseline avatar state.
 *
 * Offset objects are intentionally created per call so Solid stores and callers
 * never share mutable nested references.
 */
export function createDefaultAvatar(): AvatarData {
    return {
        head: 0,
        leftEye: 'bead',
        rightEye: 'bead',
        leftEyeOffset: { x: 0, y: 0 },
        rightEyeOffset: { x: 0, y: 0 },
        leftEyeRotation: 0,
        rightEyeRotation: 0
    };
}

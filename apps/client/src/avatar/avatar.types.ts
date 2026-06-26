import { EyeVariant } from "./avatar.assets";

export type HeadVariant = number;

/**
 * Serializable avatar customization state shared by profile APIs, editor UI,
 * and renderers.
 */
export interface AvatarData {
    head: HeadVariant;
    leftEye: EyeVariant;
    rightEye: EyeVariant;
    leftEyeOffset: { x: number; y: number };
    rightEyeOffset: { x: number; y: number };
}

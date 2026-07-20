import { EyeVariant } from "./avatar.assets";

export type HeadVariant = number;
export type EyeRotation = number;

export interface EyeOffset {
    x: number;
    y: number;
}

/**
 * Serializable avatar customization state shared by profile APIs, editor UI,
 * and renderers.
 */
export interface AvatarData {
    head: HeadVariant;
    leftEye: EyeVariant;
    rightEye: EyeVariant;
    leftEyeOffset: EyeOffset;
    rightEyeOffset: EyeOffset;
    leftEyeRotation: EyeRotation;
    rightEyeRotation: EyeRotation;
}

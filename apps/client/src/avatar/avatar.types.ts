import { AccessoryVariant, EyeVariant } from "./avatar.assets";

export type HeadVariant = number;
export type AvatarRotation = number;

export type AvatarOffset = {
    x: number;
    y: number;
}

export type AvatarTransform = {
    offset: AvatarOffset;
    rotation: AvatarRotation
}

export type AvatarPart<TVariant extends string | null> = {
    variant: TVariant
} & AvatarTransform

export type EyeSlot = AvatarPart<EyeVariant>
export type AccessorySlot = AvatarPart<AccessoryVariant | null>

/**
 * Serializable avatar customization state shared by profile APIs, editor UI,
 * and renderers.
 */
export interface AvatarData {
    head: HeadVariant;
    leftEye: EyeSlot;
    rightEye: EyeSlot;
    accessory1: AccessorySlot;
    accessory2: AccessorySlot;
}

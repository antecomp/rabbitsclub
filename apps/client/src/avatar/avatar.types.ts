import { AccessoryVariant, EyeVariant } from "./avatar.assets";

export type HeadVariant = number;
export type AvatarRotation = number;

export interface AvatarOffset {
    x: number;
    y: number;
}

export interface AvatarTransform {
    offset: AvatarOffset;
    rotation: AvatarRotation;
}

export interface AvatarPart<TVariant extends string> extends AvatarTransform {
    variant: TVariant;
}

export interface OptionalAvatarPart<TVariant extends string> extends AvatarTransform {
    variant: TVariant | null;
}

export type EyeSlot = AvatarPart<EyeVariant>;
export type AccessorySlot = OptionalAvatarPart<AccessoryVariant>;

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

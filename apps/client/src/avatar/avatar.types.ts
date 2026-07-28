import { AccessoryVariant, EyeVariant } from "./avatar.assets";

/** Zero-based index of the selected head asset. */
export type HeadVariant = number;

/** Clockwise rotation of an avatar part in degrees. */
export type AvatarRotation = number;

/** Position adjustment for an avatar part in render-space pixels. */
export type AvatarOffset = {
    /** Horizontal position adjustment. */
    x: number;
    /** Vertical position adjustment. */
    y: number;
}

/** Position and rotation adjustments applied to an avatar part. */
export type AvatarTransform = {
    /** Translation from the part's default position. */
    offset: AvatarOffset;
    /** Clockwise rotation in degrees. */
    rotation: AvatarRotation
}

/**
 * A selectable avatar part and its transform.
 *
 * @typeParam TVariant - Supported asset key, or `null` for an empty slot.
 */
export type AvatarPart<TVariant extends string | null> = {
    /** Selected asset key, or `null` when the slot is empty. */
    variant: TVariant
} & AvatarTransform

/** Configured eye part. */
export type EyeSlot = AvatarPart<EyeVariant>

/** Configured accessory part, which may be empty. */
export type AccessorySlot = AvatarPart<AccessoryVariant | null>

/** Serializable avatar customization state shared by APIs, UI, and renderers. */
export interface AvatarData {
    /** Selected head asset. */
    head: HeadVariant;
    /** Configured left eye. */
    leftEye: EyeSlot;
    /** Configured right eye. */
    rightEye: EyeSlot;
    /** First configured accessory layer. */
    accessory1: AccessorySlot;
    /** Second configured accessory layer. */
    accessory2: AccessorySlot;
}

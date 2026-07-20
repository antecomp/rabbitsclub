import { AccessoryVariant, EyeVariant, clampedHeadVariant, isAccessoryVariant, isEyeVariant } from "./avatar.assets";
import { AccessorySlot, AvatarData, AvatarOffset, EyeSlot } from "./avatar.types";

type AvatarInputSlot = {
    variant: string;
    offset: AvatarOffset;
    rotation: number;
};

type AccessoryInputSlot = {
    variant: string | null;
    offset: AvatarOffset;
    rotation: number;
};

export type AvatarInputData = {
    head: number;
    leftEye: AvatarInputSlot;
    rightEye: AvatarInputSlot;
    accessory1: AccessoryInputSlot;
    accessory2: AccessoryInputSlot;
};

function createOffset(x = 0, y = 0): AvatarOffset {
    return { x, y };
}

export function createEyeSlot(variant: EyeVariant = "bead"): EyeSlot {
    return {
        variant,
        offset: createOffset(),
        rotation: 0
    };
}

export function createAccessorySlot(variant: AccessoryVariant | null = null): AccessorySlot {
    return {
        variant,
        offset: createOffset(),
        rotation: 0
    };
}

/**
 * Creates a fresh baseline avatar state.
 *
 * Offset objects are intentionally created per call so Solid stores and callers
 * never share mutable nested references.
 */
export function createDefaultAvatar(): AvatarData {
    return {
        head: 0,
        leftEye: createEyeSlot("bead"),
        rightEye: createEyeSlot("bead"),
        accessory1: createAccessorySlot(),
        accessory2: createAccessorySlot()
    };
}

function toEyeSlot(input: AvatarInputSlot): EyeSlot | null {
    if (!isEyeVariant(input.variant)) return null;

    return {
        variant: input.variant,
        offset: { ...input.offset },
        rotation: input.rotation
    };
}

function toAccessorySlot(input: AccessoryInputSlot): AccessorySlot | null {
    if (input.variant !== null && !isAccessoryVariant(input.variant)) return null;

    return {
        variant: input.variant,
        offset: { ...input.offset },
        rotation: input.rotation
    };
}

export function toAvatarData(data: AvatarInputData | null | undefined): AvatarData | null {
    if (!data) return null;

    const leftEye = toEyeSlot(data.leftEye);
    const rightEye = toEyeSlot(data.rightEye);
    const accessory1 = toAccessorySlot(data.accessory1);
    const accessory2 = toAccessorySlot(data.accessory2);

    if (!leftEye || !rightEye || !accessory1 || !accessory2) return null;

    return {
        head: clampedHeadVariant(data.head),
        leftEye,
        rightEye,
        accessory1,
        accessory2
    };
}

export function cloneAvatarData(data: AvatarData): AvatarData {
    return {
        head: clampedHeadVariant(data.head),
        leftEye: {
            variant: data.leftEye.variant,
            offset: { ...data.leftEye.offset },
            rotation: data.leftEye.rotation
        },
        rightEye: {
            variant: data.rightEye.variant,
            offset: { ...data.rightEye.offset },
            rotation: data.rightEye.rotation
        },
        accessory1: {
            variant: data.accessory1.variant,
            offset: { ...data.accessory1.offset },
            rotation: data.accessory1.rotation
        },
        accessory2: {
            variant: data.accessory2.variant,
            offset: { ...data.accessory2.offset },
            rotation: data.accessory2.rotation
        }
    };
}

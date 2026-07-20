import { AccessoryVariant, EyeVariant, clampedHeadVariant, isAccessoryVariant, isEyeVariant } from "./avatar.assets";
import { AccessorySlot, AvatarData, AvatarOffset, EyeSlot } from "./avatar.types";

type LooseOffset = Partial<AvatarOffset> | null | undefined;
type LooseEyeSlot = {
    variant?: string;
    offset?: LooseOffset;
    rotation?: number;
} | null | undefined;
type LooseAccessorySlot = {
    variant?: string | null;
    offset?: LooseOffset;
    rotation?: number;
} | null | undefined;
type LooseAvatarData = {
    head?: number;
    leftEye?: LooseEyeSlot;
    rightEye?: LooseEyeSlot;
    accessory1?: LooseAccessorySlot;
    accessory2?: LooseAccessorySlot;
} | null | undefined;

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

function normalizeEyeSlot(value: LooseEyeSlot, fallback: EyeSlot): EyeSlot {
    const variant = value?.variant;
    let normalizedVariant: EyeSlot["variant"] = fallback.variant;
    if (typeof variant === "string" && isEyeVariant(variant)) {
        normalizedVariant = variant;
    }

    return {
        variant: normalizedVariant,
        offset: {
            x: typeof value?.offset?.x === "number" ? value.offset.x : fallback.offset.x,
            y: typeof value?.offset?.y === "number" ? value.offset.y : fallback.offset.y
        },
        rotation: typeof value?.rotation === "number" ? value.rotation : fallback.rotation
    };
}

function normalizeAccessorySlot(value: LooseAccessorySlot, fallback: AccessorySlot): AccessorySlot {
    const variant = value?.variant;
    let normalizedVariant: AccessorySlot["variant"] = fallback.variant;
    if (variant === null) {
        normalizedVariant = null;
    } else if (typeof variant === "string" && isAccessoryVariant(variant)) {
        normalizedVariant = variant;
    }

    return {
        variant: normalizedVariant,
        offset: {
            x: typeof value?.offset?.x === "number" ? value.offset.x : fallback.offset.x,
            y: typeof value?.offset?.y === "number" ? value.offset.y : fallback.offset.y
        },
        rotation: typeof value?.rotation === "number" ? value.rotation : fallback.rotation
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

export function normalizeAvatarData(data: LooseAvatarData): AvatarData {
    const defaultAvatar = createDefaultAvatar();
    if (!data) return defaultAvatar;

    return {
        head: clampedHeadVariant(typeof data.head === "number" ? data.head : defaultAvatar.head),
        leftEye: normalizeEyeSlot(data.leftEye, defaultAvatar.leftEye),
        rightEye: normalizeEyeSlot(data.rightEye, defaultAvatar.rightEye),
        accessory1: normalizeAccessorySlot(data.accessory1, defaultAvatar.accessory1),
        accessory2: normalizeAccessorySlot(data.accessory2, defaultAvatar.accessory2)
    };
}

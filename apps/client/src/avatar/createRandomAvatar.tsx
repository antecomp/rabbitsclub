import { clampedHeadVariant, heads, eyeVariants } from "@/avatar/avatar.assets";
import { createDefaultAvatar } from "@/avatar/avatar.const";
import { AvatarData } from "@/avatar/avatar.types";
import getRandomInt from "@/util/getRandomInt";
import pickRandom from "@/util/pickRandom";

// const EYE_OFFSET_RANGE = 10;

/** Creates a valid randomized avatar state using the available asset variants. */
export function createRandomAvatar(): Readonly<AvatarData> {
    const avatar = createDefaultAvatar();

    return {
        ...avatar,
        head: clampedHeadVariant(getRandomInt(heads.length)),
        leftEye: {
            ...avatar.leftEye,
            variant: pickRandom(eyeVariants)
        },
        rightEye: {
            ...avatar.rightEye,
            variant: pickRandom(eyeVariants)
        },
        // rightEye: { ...avatar.rightEye, variant: pickRandom(eyeVariants), offset: {x: getRandomInt(EYE_OFFSET_RANGE), y: getRandomInt(EYE_OFFSET_RANGE)} },
        // leftEye: { ...avatar.leftEye, variant: pickRandom(eyeVariants), offset: {x: getRandomInt(EYE_OFFSET_RANGE), y: getRandomInt(EYE_OFFSET_RANGE)} }
    };
}

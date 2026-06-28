import { clampedHeadVariant, heads, eyeVariants } from "@/avatar/avatar.assets";
import { createDefaultAvatar } from "@/avatar/avatar.const";
import { AvatarData } from "@/avatar/avatar.types";
import getRandomInt from "@/util/getRandomInt";
import pickRandom from "@/util/pickRandom";

// const EYE_OFFSET_RANGE = 10;

/** Creates a valid randomized avatar state using the available asset variants. */
export function createRandomAvatar(): Readonly<AvatarData> {
    return {
        ...createDefaultAvatar(),
        head: clampedHeadVariant(getRandomInt(heads.length)),
        leftEye: pickRandom(eyeVariants),
        rightEye: pickRandom(eyeVariants),
        // rightEyeOffset: {x: getRandomInt(EYE_OFFSET_RANGE), y: getRandomInt(EYE_OFFSET_RANGE)},
        // leftEyeOffset: {x: getRandomInt(EYE_OFFSET_RANGE), y: getRandomInt(EYE_OFFSET_RANGE)}
    };
}

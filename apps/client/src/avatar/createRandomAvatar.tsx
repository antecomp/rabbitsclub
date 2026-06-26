import { clampedHeadVariant, heads, eyeVariants } from "@/avatar/avatar.assets";
import { createDefaultAvatar } from "@/avatar/avatar.const";
import { AvatarData } from "@/avatar/avatar.types";
import pickRandom from "@/util/pickRandom";

/** Creates a valid randomized avatar state using the available asset variants. */
export function createRandomAvatar(): Readonly<AvatarData> {
    return {
        ...createDefaultAvatar(),
        head: clampedHeadVariant(Math.floor(Math.random() * heads.length)),
        leftEye: pickRandom(eyeVariants),
        rightEye: pickRandom(eyeVariants),
    };
}

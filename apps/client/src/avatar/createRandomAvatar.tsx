import { clampedHeadVariant, heads, eyeVariants } from "@/avatar/avatar.assets";
import { DEFAULT_AVATAR } from "@/avatar/avatar.const";
import { AvatarData } from "@/avatar/avatar.types";
import pickRandom from "@/util/pickRandom";

export function createRandomAvatar(): AvatarData {
    return {
        ...DEFAULT_AVATAR,
        head: clampedHeadVariant(Math.floor(Math.random() * heads.length)),
        leftEye: pickRandom(eyeVariants),
        rightEye: pickRandom(eyeVariants),
    };
}

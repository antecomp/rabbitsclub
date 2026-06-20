import { AvatarData } from "./avatar.types";
import { BE } from "../api";
import { getAvatarUrl } from "./createAvatarRenderer";

const DEFAULT_AVATAR: AvatarData = {
    head: 0,
    leftEye: 'bead',
    rightEye: "bead",
    leftEyeOffset: { x: 0, y: 0 },
    rightEyeOffset: { x: 0, y: 0 }
}

// Cache profile data by username
const profileCache = new Map<string, AvatarData>()

// Cache rendered URLs by avatar data key
const urlCache = new Map<string, string>()

export async function getProfileAvatarURL(username: string): Promise<string> {
    if(!profileCache.has(username)) {
        const { data } = await BE.profile({username}).get();
        profileCache.set(username, data ?? DEFAULT_AVATAR);
    }

    const avatar = profileCache.get(username)!
    const key = JSON.stringify(avatar);

    if(!urlCache.has(key)) {
        const url = await getAvatarUrl(avatar);
        urlCache.set(key, url);
    }

    return urlCache.get(key)!
}

export function invalidateProfile(username: string) {
    const old = profileCache.get(username)
    if (old) {
        const key = JSON.stringify(old)
        const url = urlCache.get(key)
        if (url) {
            URL.revokeObjectURL(url)
            urlCache.delete(key)
        }
    }
    profileCache.delete(username)
}
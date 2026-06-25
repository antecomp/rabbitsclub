import { AvatarData } from "./avatar.types";
import { api } from "../api/backend";
import { generateAvatarAssetURL } from "./createAvatarRenderer";
import { clampedHeadVariant, isEyeVariant } from "./avatar.assets";
import { createDefaultAvatar } from "./avatar.const";

// Cache profile data by username
const profileCache = new Map<string, AvatarData>()

// Cache rendered URLs by avatar data key
const urlCache = new Map<string, string>()

// initial load of messages send a torrent of these requests.
// prevent generating a ton of unique uneeded blobs by capturing inflight
const inFlight = new Map<string, Promise<string>>()

export async function loadAvatarForUser(username: string): Promise<string> {
    // Return cached URL immediately if available
    if (profileCache.has(username)) {
        const key = JSON.stringify(profileCache.get(username))
        if (urlCache.has(key)) return urlCache.get(key)!
    }

    if (inFlight.has(username)) return inFlight.get(username)!

    const promise = (async () => {
        if (!profileCache.has(username)) {
            const { data } = await api.profile({ username }).get()
            const defaultAvatar = createDefaultAvatar();
            if (!data) {
                profileCache.set(username, defaultAvatar);
            } else {
                const avatar: AvatarData = {
                    head: clampedHeadVariant(data.head),
                    leftEye: isEyeVariant(data.leftEye) ? data.leftEye : defaultAvatar.leftEye,
                    rightEye: isEyeVariant(data.rightEye) ? data.rightEye : defaultAvatar.rightEye,
                    leftEyeOffset: data.leftEyeOffset ? { ...data.leftEyeOffset } : defaultAvatar.leftEyeOffset,
                    rightEyeOffset: data.rightEyeOffset ? { ...data.rightEyeOffset } : defaultAvatar.rightEyeOffset
                }
                profileCache.set(username, avatar);
            }
        }

        const avatar = profileCache.get(username)!
        const key = JSON.stringify(avatar)

        if (!urlCache.has(key)) {
            const url = await generateAvatarAssetURL(avatar)
            urlCache.set(key, url)
        }

        inFlight.delete(username)
        return urlCache.get(JSON.stringify(profileCache.get(username)))!
    })()

    inFlight.set(username, promise)
    return promise
}

export function invalidateCachedProfile(username: string) {
    inFlight.delete(username);
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

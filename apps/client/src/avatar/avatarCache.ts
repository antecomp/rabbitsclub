import { AvatarData } from "./avatar.types";
import { api } from "../api/backend";
import { generateAvatarAssetURL } from "./createAvatarRenderer";
import { clampedHeadVariant, isEyeVariant } from "./assets";
import { DEFAULT_AVATAR } from "./const";

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

    // If already in flight, wait for that same promise
    if (inFlight.has(username)) return inFlight.get(username)!

    // Otherwise start a new request and track it
    const promise = (async () => {
        if (!profileCache.has(username)) {
            const { data } = await api.profile({ username }).get()
            if (!data) {
                profileCache.set(username, DEFAULT_AVATAR);
            } else {
                const avatar: AvatarData = {
                    head: clampedHeadVariant(data.head),
                    leftEye: isEyeVariant(data.leftEye) ? data.leftEye : DEFAULT_AVATAR.leftEye,
                    rightEye: isEyeVariant(data.rightEye) ? data.rightEye : DEFAULT_AVATAR.rightEye,
                    leftEyeOffset: data.leftEyeOffset,
                    rightEyeOffset: data.rightEyeOffset
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
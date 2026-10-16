import { AvatarData } from './avatar.types';
import { api } from '../api/backend';
import { generateAvatarAssetURL } from './createAvatarRenderer';
import { createDefaultAvatar, toAvatarData } from './avatar.const';

// Cache profile data by user ID.
const profileCache = new Map<number, AvatarData>();

// Cache rendered URLs by avatar data key.
const urlCache = new Map<string, string>();

// Initial message loads request many avatars at once; share in-flight work for
// the same user ID to avoid duplicate network requests and object URLs.
const inFlight = new Map<number, Promise<string>>();

/**
 * Fetches, normalizes, renders, and caches the avatar image URL for a user.
 *
 * Returned URLs are object URLs owned by this cache. Call
 * {@link invalidateCachedProfile} when the user's profile avatar changes.
 */
export async function loadAvatarForUser(userId: number): Promise<string> {
    // Return cached URL immediately if available
    if (profileCache.has(userId)) {
        const key = JSON.stringify(profileCache.get(userId));
        if (urlCache.has(key)) return urlCache.get(key)!;
    }

    if (inFlight.has(userId)) return inFlight.get(userId)!;

    const promise = (async () => {
        if (!profileCache.has(userId)) {
            const { data } = await api.profile({ id: userId }).get();
            if (!data) {
                profileCache.set(userId, createDefaultAvatar());
            } else {
                profileCache.set(userId, toAvatarData(data) ?? createDefaultAvatar());
            }
        }

        const avatar = profileCache.get(userId)!;
        const key = JSON.stringify(avatar);

        if (!urlCache.has(key)) {
            const url = await generateAvatarAssetURL(avatar);
            urlCache.set(key, url);
        }

        inFlight.delete(userId);
        return urlCache.get(JSON.stringify(profileCache.get(userId)))!;
    })();

    inFlight.set(userId, promise);
    return promise;
}

/**
 * Clears cached profile data and revokes any rendered object URL for a user.
 */
export function invalidateCachedProfile(userId: number) {
    inFlight.delete(userId);
    const old = profileCache.get(userId);
    if (old) {
        const key = JSON.stringify(old);
        const url = urlCache.get(key);
        if (url) {
            URL.revokeObjectURL(url);
            urlCache.delete(key);
        }
    }
    profileCache.delete(userId);
}

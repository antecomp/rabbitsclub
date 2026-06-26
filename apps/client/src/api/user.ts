import { createResource } from "solid-js"
import { api } from "./backend"

/**
 * Global resource for the currently authenticated user.
 *
 * Refetch this after login, logout, registration, or profile-affecting changes
 * so route guards and navigation state react to the latest session.
 */
export const [user, { refetch: refetchUser }] = createResource(async () => {
    const { data } = await api.auth.me.get();
    if (!data) return null; // coalesce random falsy responses (i.e undefined, "")
    return data;
});

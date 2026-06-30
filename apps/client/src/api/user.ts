import { createResource } from "solid-js"
import { api } from "./backend"



export const [
    /**
    * Global resource for the currently authenticated user.
    *
    * Refetch this {@link refetchUser} after login, logout, registration, or profile-affecting changes
    * so route guards and navigation state react to the latest session.
    **/
    user,
    /** Reload current user resource.
    * @note-- refetchUser uses the same fetch method as everywhere else.Therefore, authentication
    * errors during a user refetch will still trigger the same auth failure side effects.
    * You can use this method to cleanly fetch recent user state and automatically bump if unauthenticated.
    * If the user simply doesn't exist (not logged in, logged out), it will *not* throw. It just returns `null` for the user.
    */
    { refetch: refetchUser }
] = createResource(async () => {
    const { data } = await api.auth.me.get();
    if (!data) return null; // coalesce random falsy responses (i.e undefined, "")
    return data;
});

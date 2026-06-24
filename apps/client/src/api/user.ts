import { createResource } from "solid-js"
import { api } from "./backend"

export const [user, { refetch: refetchUser }] = createResource(async () => {
    const { data } = await api.auth.me.get();
    if (!data) return null; // coalesce random falsy responses (i.e undefined, "")
    return data;
});
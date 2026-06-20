import { createResource } from "solid-js"
import { api } from "./backend"

export const [user, { refetch: refetchUser }] = createResource(async () => {
    const { data } = await api.auth.me.get()
    return data ?? null
})
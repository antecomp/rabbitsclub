import { createResource } from "solid-js"
import { api } from "./backend"

const USER_STORAGE_KEY = "rabbitsclub.user"

export const [user, { refetch: refetchUser, mutate: mutateUser }] = createResource(async () => {
    const { data } = await api.auth.me.get()
    const result = data || null
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result))
    return result
})

window.addEventListener("storage", (e) => {
    if (e.key !== USER_STORAGE_KEY) return
    const next = e.newValue ? JSON.parse(e.newValue) : null
    mutateUser(next)
})
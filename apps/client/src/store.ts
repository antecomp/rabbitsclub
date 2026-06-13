// src/store.ts
import { createResource } from "solid-js"
import { BE } from "./api"

export const [user, { refetch: refetchUser }] = createResource(async () => {
    const { data } = await BE.auth.me.get()
    return data ?? null
})
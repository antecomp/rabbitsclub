import { treaty, type Treaty } from "@elysiajs/eden"
import type { App } from "~/index"

/** Type-safe Eden Treaty client for the backend API. */
export const api: Treaty.Create<App> = treaty<App>(import.meta.env.VITE_API_URL!, {
    fetch: {
        credentials: "include"
    }
})

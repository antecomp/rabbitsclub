import { treaty } from "@elysiajs/eden"
import type { App } from "~/index"

export const api = treaty<App>(import.meta.env.VITE_API_URL!, {
    fetch: {
        credentials: "include"
    }
})

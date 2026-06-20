import { treaty } from "@elysiajs/eden"
import type { App } from "../../server/src/index"

export const BE = treaty<App>(import.meta.env.VITE_API_URL!, {
    fetch: {
        credentials: "include"
    }
})
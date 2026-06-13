import { treaty } from "@elysiajs/eden"
import type { App } from "../../server/src/index"

// Empty string routes requests through the Vite proxy
export const BE = treaty<App>("http://localhost:3000")

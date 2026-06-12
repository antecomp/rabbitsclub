import { edenTreaty } from "@elysiajs/eden";
import type { App } from "../../server/src/index";


//export const BE = edenTreaty<App>(import.meta.env.VITE_API_URL);
// The Vite proxy intercepts /api/* before it ever leaves the browser, 
// so no host is needed. The VITE_API_URL env var only makes sense 
// if you're hitting the backend directly 
// (e.g. in production where there's no Vite proxy).
export const BE = edenTreaty<App>("");
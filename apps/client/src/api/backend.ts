import { treaty, type Treaty } from "@elysiajs/eden"
import type { App } from "~/index"
import { AuthErrorCode } from "~/schemas/users.schema";
import { notifyAuthFailure } from "./auth";

const authAwareFetcher: typeof fetch = Object.assign(
    async (...args: Parameters<typeof fetch>) => {
        const res = await fetch(...args);

        if(res.status === 401) {
            // Clone so Eden can still read the body.
            const clone = res.clone();
            try {
                const body = await clone.json() as {code?: AuthErrorCode}
                notifyAuthFailure(body.code ?? "unauthenticated")
            } catch {
                notifyAuthFailure("unauthenticated");
            }
        }

        return res;
    },
    { preconnect: fetch.preconnect }
)

/** Type-safe Eden Treaty client for the backend API. */
export const api: Treaty.Create<App> = treaty<App>(import.meta.env.VITE_API_URL!, {
    fetch: {
        credentials: "include"
    },
    fetcher: authAwareFetcher
})

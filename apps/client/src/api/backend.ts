import { treaty, type Treaty } from "@elysiajs/eden"
import type { App } from "~/index"
import type { AuthErrorCode } from "~/schemas/auth.schema";
import { AUTH_FAILURE_EXCLUDED_PATHS, notifyAuthFailure } from "./auth";

/**
 * Extracts the pathname from a fetch request input.
 * @param input - The fetch RequestInfo or URL object
 * @returns The pathname string from the request
 */
function getRequestPath(input: RequestInfo | URL) {
    if (typeof input === "string") {
        return new URL(input, window.location.origin).pathname
    }

    if (input instanceof URL) {
        return input.pathname
    }

    return new URL(input.url).pathname
}

/**
 * Custom fetch implementation that handles authentication failures.
 * Intercepts 401 responses and notifies the auth system, allowing for logout or token refresh.
 * Includes credentials in requests and preserves response cloning for Eden consumption.
 */
const authAwareFetcher: typeof fetch = Object.assign(
    async (...args: Parameters<typeof fetch>) => {
        const path = getRequestPath(args[0])
        const res = await fetch(...args);

        if(res.status === 401 && !AUTH_FAILURE_EXCLUDED_PATHS.has(path)) {
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

/**
 * Type-safe Eden Treaty client for the backend API.
 * Provides strongly-typed endpoints and methods for communicating with the server.
 * Automatically handles authentication failures by notifying the auth system.
 * @see {@link authAwareFetcher} for authentication error handling details
 */
export const api: Treaty.Create<App> = treaty<App>(import.meta.env.VITE_API_URL!, {
    fetch: {
        credentials: "include"
    },
    fetcher: authAwareFetcher
})

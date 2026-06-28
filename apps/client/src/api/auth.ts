import { AuthErrorCode } from "~/schemas/users.schema";

type AuthFailureHandler = (code: AuthErrorCode) => void;

const authFailureHandlers = new Set<AuthFailureHandler>();

/**
 * Register a handler for authentication failure events.
 * Returns a cleanup function that removes the handler.
 */
export function onAuthFailure(handler: AuthFailureHandler) {
    authFailureHandlers.add(handler);
    return () => authFailureHandlers.delete(handler);
}

/** Executes all authentication failure handlers (right now this is just reserved for {@link AuthGuard.tsx}) */
export function notifyAuthFailure(code: AuthErrorCode) {
    for(const handler of authFailureHandlers) handler(code);
}

// TODO: Move this somewhere cleaner later.
export const AUTH_FAILURE_EXCLUDED_PATHS = new Set([
  "/auth/login",
  "/auth/register"
])
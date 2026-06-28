import { AuthErrorCode } from "~/schemas/users.schema";

type AuthFailureHandler = (code: AuthErrorCode) => void;

const authFailureHandlers = new Set<AuthFailureHandler>();

export function onAuthFailure(handler: AuthFailureHandler) {
    authFailureHandlers.add(handler);
    return () => authFailureHandlers.delete(handler);
}

export function notifyAuthFailure(code: AuthErrorCode) {
    for(const handler of authFailureHandlers) handler(code);
}

// TODO: Move this somewhere cleaner later.
export const AUTH_FAILURE_EXCLUDED_PATHS = new Set([
  "/auth/login",
  "/auth/register"
])
import { Accessor, createEffect, onCleanup } from "solid-js"
import { api } from "./backend"
import type { AuthErrorCode } from "~/schemas/auth.schema"

type ChatSubscription = ReturnType<typeof api.ws.subscribe>
type ChatMessageHandler = Parameters<ChatSubscription["subscribe"]>[0]
type ChatSendPayload = Parameters<ChatSubscription["send"]>[0]

/**
 * Represents reasons for chat authentication failures.
 */
export type ChatAuthErrorCode = Exclude<AuthErrorCode, 'origin_not_allowed'>;

/** Set of authentication-related close reasons to identify auth failures. */
const AUTH_CLOSE_REASONS = new Set<ChatAuthErrorCode>([
    "unauthenticated",
    "session_expired",
    "session_revoked"
])

/** Delay in milliseconds before attempting to reconnect after an unexpected close. */
const RECONNECT_DELAY_MS = 1000

/**
 * Extracts an authentication failure reason from a WebSocket close event.
 * Checks both the close event reason string and close code for auth-related failures.
 * @param {CloseEvent} event - The WebSocket close event
 * @returns {ChatAuthErrorCode | null} The authentication failure reason, or null if not auth-related
 */
function getAuthCloseReason(event: CloseEvent): ChatAuthErrorCode | null {
    if (AUTH_CLOSE_REASONS.has(event.reason as ChatAuthErrorCode)) {
        return event.reason as ChatAuthErrorCode
    }

    if (event.code === 4001) return "session_revoked"
    if (event.code === 4002) return "session_expired"

    return null
}

/**
 * Creates an authentication-aware WebSocket chat connection that automatically manages reconnection.
 * Monitors authentication state and closes the socket when the user logs out.
 * Handles various authentication failure scenarios and triggers callbacks appropriately.
 * @param {Object} options - Configuration options
 * @param {Accessor<boolean>} options.isAuthenticated - Reactive accessor for authentication state
 * @param {ChatMessageHandler} options.onMessage - Callback fired when a message is received
 * @param {Function} options.onAuthFailure - Callback fired when authentication fails, receives failure reason
 * @returns {Object} Chat socket interface
 * @returns {Function} returns.send - Sends a message payload through the socket
 * @returns {Function} returns.close - Manually closes the socket connection
 */
export function createAuthAwareChatSocket(options: {
    isAuthenticated: Accessor<boolean>
    onMessage: ChatMessageHandler
    onAuthFailure: (reason: ChatAuthErrorCode) => void
}) {
    let socket: ChatSubscription | undefined
    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined
    let manuallyClosed = false
    let disposed = false

    const clearReconnect = () => {
        if (!reconnectTimeout) return
        clearTimeout(reconnectTimeout)
        reconnectTimeout = undefined
    }

    const closeSocket = () => {
        manuallyClosed = true
        clearReconnect()
        socket?.close()
        socket = undefined
    }

    const handleAmbiguousClose = async () => {
        if (disposed || manuallyClosed) return

        try {
            // 401 triggers global onAuthFailure automatically
            await api.auth.me.get()
        } catch {
            if (disposed || manuallyClosed) return
        }

        if (disposed || manuallyClosed) return
        scheduleReconnect()
    }

    const scheduleReconnect = () => {
        if (disposed || manuallyClosed || reconnectTimeout || !options.isAuthenticated()) return

        reconnectTimeout = setTimeout(() => {
            reconnectTimeout = undefined
            openSocket()
        }, RECONNECT_DELAY_MS)
    }

    const openSocket = () => {
        if (disposed || socket || !options.isAuthenticated()) return

        manuallyClosed = false
        const nextSocket = api.ws.subscribe()
        socket = nextSocket

        nextSocket.subscribe(options.onMessage)
        nextSocket.on("close", (event) => {
            // only clear the active socket reference if the socket that closed is still the active one.
            if (socket === nextSocket) socket = undefined
            const authReason = getAuthCloseReason(event)

            if (authReason) {
                clearReconnect()
                options.onAuthFailure(authReason)
                return
            }

            if (manuallyClosed) return

            void handleAmbiguousClose()
        })
    }

    createEffect(() => {
        if (options.isAuthenticated()) {
            openSocket()
            return
        }

        closeSocket()
    })

    onCleanup(() => {
        disposed = true
        closeSocket()
    })

    return {
        send(payload: ChatSendPayload) {
            socket?.send(payload)
        },
        close: closeSocket
    }
}

import { Accessor, createEffect, onCleanup } from "solid-js"
import { api } from "./backend"

type ChatSubscription = ReturnType<typeof api.ws.subscribe>
type ChatMessageHandler = Parameters<ChatSubscription["subscribe"]>[0]
type ChatSendPayload = Parameters<ChatSubscription["send"]>[0]

// consider pulling type from BE
export type ChatAuthFailureReason = "unauthenticated" | "session_expired" | "session_revoked"

const AUTH_CLOSE_REASONS = new Set<ChatAuthFailureReason>([
    "unauthenticated",
    "session_expired",
    "session_revoked"
])

const RECONNECT_DELAY_MS = 1000

function getAuthCloseReason(event: CloseEvent): ChatAuthFailureReason | null {
    if (AUTH_CLOSE_REASONS.has(event.reason as ChatAuthFailureReason)) {
        return event.reason as ChatAuthFailureReason
    }

    if (event.code === 4001) return "session_revoked"
    if (event.code === 4002) return "session_expired"

    return null
}

function getAuthFailureReason(value: unknown): ChatAuthFailureReason {
    if (
        value
        && typeof value === "object"
        && "code" in value
        && AUTH_CLOSE_REASONS.has(value.code as ChatAuthFailureReason)
    ) {
        return value.code as ChatAuthFailureReason
    }

    return "unauthenticated"
}

export function createAuthAwareChatSocket(options: {
    isAuthenticated: Accessor<boolean>
    onMessage: ChatMessageHandler
    onAuthFailure: (reason: ChatAuthFailureReason) => void
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
        try {
            const { data, error, status } = await api.auth.me.get()
            if (disposed || manuallyClosed) return

            if (status === 401) {
                options.onAuthFailure(getAuthFailureReason(error?.value))
                return
            }

            if (status === 200 && !data) {
                options.onAuthFailure("unauthenticated")
                return
            }
        } catch {
            if (disposed || manuallyClosed) return
        }

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

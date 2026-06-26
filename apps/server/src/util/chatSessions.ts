type ChatSocket = {
    close(code?: number, reason?: string): void
}

type RegisteredChatSocket = {
    socket: ChatSocket
    expiresTimeout: ReturnType<typeof setTimeout>
}

const socketsByUser = new Map<number, Map<ChatSocket, RegisteredChatSocket>>()

export function registerChatSocket(userId: number, socket: ChatSocket, expiresAt: number) {
    const sockets = socketsByUser.get(userId)
    const expiresInMs = Math.max(0, expiresAt * 1000 - Date.now())
    const registered = {
        socket,
        expiresTimeout: setTimeout(() => {
            socket.close(4002, "session_expired")
        }, expiresInMs)
    }

    if (sockets) {
        sockets.set(socket, registered)
        return
    }

    socketsByUser.set(userId, new Map([[socket, registered]]))
}

export function unregisterChatSocket(userId: number, socket: ChatSocket) {
    const sockets = socketsByUser.get(userId)
    if (!sockets) return

    const registered = sockets.get(socket)
    if (registered) clearTimeout(registered.expiresTimeout)

    sockets.delete(socket)
    if (sockets.size === 0) socketsByUser.delete(userId)
}

export function disconnectChatSocketsForUser(userId: number) {
    const sockets = socketsByUser.get(userId)
    if (!sockets) return 0

    const snapshot = Array.from(sockets.values())
    for (const { socket, expiresTimeout } of snapshot) {
        clearTimeout(expiresTimeout)
        socket.close(4001, "session_revoked")
    }

    return snapshot.length
}

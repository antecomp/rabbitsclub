type ChatSocket = {
    close(code?: number, reason?: string): void
}

const socketsByUser = new Map<number, Set<ChatSocket>>()

export function registerChatSocket(userId: number, socket: ChatSocket) {
    const sockets = socketsByUser.get(userId)
    if (sockets) {
        sockets.add(socket)
        return
    }

    socketsByUser.set(userId, new Set([socket]))
}

export function unregisterChatSocket(userId: number, socket: ChatSocket) {
    const sockets = socketsByUser.get(userId)
    if (!sockets) return

    sockets.delete(socket)
    if (sockets.size === 0) socketsByUser.delete(userId)
}

export function disconnectChatSocketsForUser(userId: number) {
    const sockets = socketsByUser.get(userId)
    if (!sockets) return 0

    const snapshot = Array.from(sockets)
    for (const socket of snapshot) {
        socket.close(4001, "session_revoked")
    }

    return snapshot.length
}

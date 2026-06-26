type ChatSocket = {
    close(code?: number, reason?: string): void
}

type ChatSocketRegistration = {
    socket: ChatSocket
    expiresTimeout: ReturnType<typeof setTimeout>
}

// Each user can have multiple open chat instances at once, such as separate tabs.
// Store one registration per open socket so the lifecycle is explicit.
const socketsByUser = new Map<number, ChatSocketRegistration[]>()

function getOrCreateUserSockets(userId: number) {
    let registrations = socketsByUser.get(userId)
    if (!registrations) {
        registrations = []
        socketsByUser.set(userId, registrations)
    }

    return registrations
}

export function registerChatSocket(userId: number, socket: ChatSocket, expiresAt: number) {
    const registrations = getOrCreateUserSockets(userId)
    const expiresInMs = Math.max(0, expiresAt * 1000 - Date.now())
    const existing = registrations.find(entry => entry.socket === socket)

    if (existing) {
        clearTimeout(existing.expiresTimeout)
        existing.expiresTimeout = setTimeout(() => {
            socket.close(4002, "session_expired")
        }, expiresInMs)
        return
    }

    registrations.push({
        socket,
        expiresTimeout: setTimeout(() => {
            socket.close(4002, "session_expired")
        }, expiresInMs)
    })
}

export function unregisterChatSocket(userId: number, socket: ChatSocket) {
    const registrations = socketsByUser.get(userId)
    if (!registrations) return

    const index = registrations.findIndex(entry => entry.socket === socket)
    if (index === -1) return

    const registration = registrations[index]
    if (!registration) return

    clearTimeout(registration.expiresTimeout)
    registrations.splice(index, 1)

    if (registrations.length === 0) socketsByUser.delete(userId)
}

export function disconnectChatSocketsForUser(userId: number) {
    const registrations = socketsByUser.get(userId)
    if (!registrations) return 0

    const snapshot = [...registrations]
    socketsByUser.delete(userId)

    for (const { socket, expiresTimeout } of snapshot) {
        clearTimeout(expiresTimeout)
        socket.close(4001, "session_revoked")
    }

    return snapshot.length
}

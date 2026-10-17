import { MESSAGE_RATE_LIMIT } from '~/config';

type MessageWindow = {
    count: number;
    resetAt: number;
    timeoutId: ReturnType<typeof setTimeout>;
};

// Keyed by account so tabs and reconnects share one message budget.
const windows = new Map<number, MessageWindow>();

/** Consumes one message slot, or returns the remaining wait in milliseconds. */
export function chokeMessage(userId: number): number {
    const now = Date.now();
    const current = windows.get(userId);

    if (!current || now >= current.resetAt) {
        if (current) clearTimeout(current.timeoutId);

        const window: MessageWindow = {
            count: 1,
            resetAt: now + MESSAGE_RATE_LIMIT.DURATION,
            timeoutId: setTimeout(() => {
                if (windows.get(userId) === window) windows.delete(userId);
            }, MESSAGE_RATE_LIMIT.DURATION)
        };
        windows.set(userId, window);
        return 0;
    }

    if (current.count >= MESSAGE_RATE_LIMIT.MAX) {
        return current.resetAt - now;
    }

    current.count++;
    return 0;
}

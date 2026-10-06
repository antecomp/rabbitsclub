import { format } from 'date-fns';
import { type ModerationUser, type UserPermissions } from '~/schemas/moderation.schema';

/** Presentation shape of moderation events (such as banning) */
export interface ModerationEventSummary {
    actor: string | null;
    occurredAt: string | null;
    reason: string | null;
}

/** Presentation shape for moderation 
 * information about an account */
export interface ModerationSummary {
    isAdmin: boolean;
    isBanned: boolean;
    ban: ModerationEventSummary;
    unban: ModerationEventSummary;
    permissions: UserPermissions
}

function formatModerationDate(value: string | null) {
    return value ? format(new Date(value), 'dd.MM.yy') : null;
}

export const toModerationSummary = (user: ModerationUser): ModerationSummary => {
    return {
        isAdmin: user.is_admin,
        isBanned: user.is_banned,
        ban: {
            actor: user.banned_by_username,
            occurredAt: formatModerationDate(user.banned_at),
            reason: user.banned_reason
        },
        unban: {
            actor: user.unbanned_by_username,
            occurredAt: formatModerationDate(user.unbanned_at),
            reason: user.unbanned_reason
        },
        permissions: user.permissions
    };
};

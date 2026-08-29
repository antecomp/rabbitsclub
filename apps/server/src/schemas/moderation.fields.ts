import type { User } from './users.schema';

/** Direct fields on `UserSchema` we want to
 * extract for {@link ModerationUserSchema} (and related logic).
*/
export const moderationUserFields = [
    'id',
    'username',
    'is_admin',
    'is_banned',
    'banned_reason',
    'banned_by',
    'banned_at',
    'unbanned_by',
    'unbanned_reason',
    'unbanned_at'
] as const satisfies (keyof User)[];

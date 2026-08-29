import { t } from 'elysia';
import type { actions } from '~/db/actions';
import { model } from '~/db/model';
import { spread } from '~/db/utils';
import { UserSchema, type User } from './users.schema';

// Custom type because we're swaying the SQL numbers to booleans + omitting info
export const UserPermissionsSchema = t.Omit(
    t.Object(model.select.userPermissions),
    ['user_id']
);

export const UpdateUserPermissionsSchema = t.Partial(
    UserPermissionsSchema,
    { minProperties: 1 }
);

export type ModerationUserRow = ReturnType<
    typeof actions.moderation.listUsersWithPermissions
>[number];

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
    'unbanned_at',
] as const satisfies (keyof User)[];

export const ModerationUserSchema = t.Object({
    ...spread(t.Pick(UserSchema, moderationUserFields)),
    permissions: UserPermissionsSchema,
    // (TODO):
    // banned_by_username: t.Nullable(t.String()),
    // unbanned_by_username: t.Nullable(t.String())
});

export type UserPermissions = typeof UserPermissionsSchema['static'];
export type UpdateUserPermissions = typeof UpdateUserPermissionsSchema['static'];
export type ModerationUser = typeof ModerationUserSchema['static'];

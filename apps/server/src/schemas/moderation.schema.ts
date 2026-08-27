import { t } from 'elysia';
import type { actions } from '~/db/actions';
import { model } from '~/db/model';

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

export const ModerationUserSchema = t.Object({
    id:                 model.select.users.id,
    username:           model.select.users.username,
    is_admin:           model.select.users.is_admin,
    permissions:        UserPermissionsSchema,
    is_banned:          model.select.users.is_banned,
    banned_reason:      model.select.users.banned_reason,
    banned_by:          model.select.users.banned_by,
    banned_at:          model.select.users.banned_at,
    unbanned_by:        model.select.users.unbanned_by,
    unbanned_reason:    model.select.users.unbanned_reason,
    unbanned_at:        model.select.users.unbanned_at
});

export type UserPermissions = typeof UserPermissionsSchema['static'];
export type UpdateUserPermissions = typeof UpdateUserPermissionsSchema['static'];
export type ModerationUser = typeof ModerationUserSchema['static'];

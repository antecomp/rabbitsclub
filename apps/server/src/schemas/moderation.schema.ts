import { t } from 'elysia';
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

export const ModerationUserSchema = t.Object({
    id:          model.select.users.id,
    username:    model.select.users.username,
    is_admin:    model.select.users.is_admin,
    permissions: UserPermissionsSchema,
    is_banned: model.select.users.is_banned
});

export type UserPermissions = typeof UserPermissionsSchema['static'];
export type UpdateUserPermissions = typeof UpdateUserPermissionsSchema['static'];
export type ModerationUser = typeof ModerationUserSchema['static'];

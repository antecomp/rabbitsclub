import { t } from 'elysia';
import { model } from '~/db/model';
import { spread } from '~/db/utils';
import { UserSchema } from './users.schema';
import { moderationUserFields } from './moderation.fields';

export const UserPermissionsSchema = t.Omit(
    t.Object(model.select.userPermissions),
    ['user_id']
);

export const UpdateUserPermissionsSchema = t.Partial(
    UserPermissionsSchema,
    { minProperties: 1 }
);

export const ModerationUserSchema = t.Object({
    ...spread(t.Pick(UserSchema, moderationUserFields)),
    permissions: UserPermissionsSchema,
    banned_by_username: t.Nullable(t.String()),
    unbanned_by_username: t.Nullable(t.String())
});

export type UserPermissions = typeof UserPermissionsSchema['static'];
export type UpdateUserPermissions = typeof UpdateUserPermissionsSchema['static'];
export type ModerationUser = typeof ModerationUserSchema['static'];

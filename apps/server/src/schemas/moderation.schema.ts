import { t } from "elysia";

// Custom type because we're swaying the SQL numbers to booleans + omitting info
export const UserPermissionsSchema = t.Object({
    can_ban_users: t.Boolean(),
    can_delete_messages: t.Boolean(),
    can_leave_notes: t.Boolean(),
    can_manage_invites: t.Boolean(),
})

export type UserPermissions = typeof UserPermissionsSchema['static'];
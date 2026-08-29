import * as schema from '../schema';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from '..';
import { TIME_FORMAT } from '../time';
import { pickFields } from '~/util/pickFields';
import { moderationUserFields } from '~/schemas/moderation.fields';
import { alias } from 'drizzle-orm/sqlite-core';
import { userPermissionColumns } from '~/schemas/permissions.schema';

const userColumns = getTableColumns(schema.users);
const moderationUserColumns = pickFields(
    userColumns,
    moderationUserFields
);

// alias for self-joining.
const banningUser = alias(schema.users, 'banning_user');
const unbanningUser = alias(schema.users, 'unbanning_user');

const moderationUserSelection = {
    ...moderationUserColumns,

    // I imagine you can refactor this into another
    // nice permissions list to pick by later, too.
    permissions: userPermissionColumns,

    banned_by_username: banningUser.username,
    unbanned_by_username: unbanningUser.username
};

function moderationUsersQuery() {
    return db
        .select(moderationUserSelection)
        .from(schema.users)
        .leftJoin(
            schema.userPermissions,
            eq(schema.userPermissions.user_id, schema.users.id)
        )
        .leftJoin(
            banningUser,
            eq(banningUser.id, schema.users.banned_by)
        )
        .leftJoin(
            unbanningUser,
            eq(unbanningUser.id, schema.users.unbanned_by)
        );
}

export function listModerationUsers() {
    return moderationUsersQuery()
        .orderBy(schema.users.id)
        .all();
}

export function getModerationUser(id: number) {
    return moderationUsersQuery()
        .where(eq(schema.users.id, id))
        .get();
}

export type ModerationUserRow =
    NonNullable<ReturnType<typeof getModerationUser>>;

export default {
    listModerationUsers,
    getModerationUser,

    getUserPermissions: (user_id: number) => db.select(userPermissionColumns)
        .from(schema.userPermissions)
        .where(eq(schema.userPermissions.user_id, user_id))
        .get(),

    upsertUserPermissions: (
        user_id: number,
        // odd type to keep parity with db schema
        permissions: Partial<Omit<typeof schema.userPermissions.$inferSelect, 'user_id'>>
    ) => db.insert(schema.userPermissions)
        .values({ user_id, ...permissions })
        .onConflictDoUpdate({
            target: schema.userPermissions.user_id,
            set: permissions
        })
        .returning(userPermissionColumns)
        .get(),


    banUser: (userId: number, bannedBy: number, reason?: string) => db.update(schema.users)
        .set({
            is_banned: true,
            banned_reason: reason ?? null,
            banned_by: bannedBy,
            banned_at: sql`(strftime(${TIME_FORMAT}, 'now'))`,
            token_version: sql`${schema.users.token_version} + 1`
        })
        .where(eq(schema.users.id, userId))
        .returning()
        .get(),

    unbanUser: (userId: number, unbannedBy: number, reason?: string) => db.update(schema.users)
        .set({
            is_banned: false,
            // preserve ban history, don't undo banned notes.
            unbanned_at: sql`(strftime(${TIME_FORMAT}, 'now'))`,
            unbanned_by: unbannedBy,
            unbanned_reason: reason
        })
        .where(eq(schema.users.id, userId))
        .returning()
        .get()
};

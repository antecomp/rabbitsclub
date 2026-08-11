import * as schema from '../schema';
import { eq, sql } from 'drizzle-orm';
import { db } from '..';
import { TIME_FORMAT } from '../time';

export default {
    listUsersWithPermissions: () => db.select({
        id:          schema.users.id,
        username:    schema.users.username,
        is_admin:    schema.users.is_admin,
        permissions: {
            can_ban_users:       schema.userPermissions.can_ban_users,
            can_delete_messages: schema.userPermissions.can_delete_messages,
            can_leave_notes:     schema.userPermissions.can_leave_notes,
            can_manage_invites:  schema.userPermissions.can_manage_invites
        }
    })
        .from(schema.users)
        .leftJoin(
            schema.userPermissions,
            eq(schema.userPermissions.user_id, schema.users.id)
        )
        .orderBy(schema.users.id)
        .all(),

    getUserPermissions: (user_id: number) => db.select()
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
        .returning()
        .get(),

    // Banning
    banUser: (userId: number, bannedBy: number, reason?: string) => db.update(schema.users)
        .set({
            is_banned: 1,
            banned_reason: reason ?? null,
            banned_by: bannedBy,
            banned_at: sql`(strftime(${TIME_FORMAT}, 'now'))`,
            token_version: sql`${schema.users.token_version} + 1`
        })
        .where(eq(schema.users.id, userId))
        .returning()
        .get(),

    unbanUser: (userId: number) => db.update(schema.users)
        .set({
            is_banned: 0,
            banned_reason: null,
            banned_by: null,
            banned_at: null
        })
        .where(eq(schema.users.id, userId))
        .returning()
        .get()
};

import * as schema from "../schema"
import { eq, sql } from "drizzle-orm"
import { db } from ".."

export default {
    getUserPermissions: (user_id: number) => db.select()
        .from(schema.userPermissions)
        .where(eq(schema.userPermissions.user_id, user_id))
        .get(),

    upsertUserPermissions: (user_id: number, permissions: Partial<{
        can_ban_users: number
        can_delete_messages: number
        can_leave_notes: number
        can_manage_invites: number
    }>) => db.insert(schema.userPermissions)
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
            banned_at: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
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
        .get(),
}
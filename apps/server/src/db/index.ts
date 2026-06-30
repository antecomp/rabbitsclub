import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { join } from "path"
import { and, desc, eq, isNull, lt, sql } from "drizzle-orm"
import * as schema from "./schema"
import type { AvatarData } from "../schemas/profiles.schema"
import { MESSAGE_PAGE_SIZE } from "#config"
import parseAvatarData from "~/util/parseAvatarData"

const dbPath = process.env.DB_PATH ?? join(import.meta.dir, "../../chat.db")
const migrationsPath = process.env.MIGRATIONS_PATH ?? join(import.meta.dir, "../../migrations")
const sqlite = new Database(dbPath, { create: true })
sqlite.run("PRAGMA journal_mode = WAL")

export const db = drizzle(sqlite, { schema })

// Auto-apply pending migrations on startup
migrate(db, { migrationsFolder: migrationsPath });


// TODO: Break this into multiple actions/* files and glob this together.
export const actions = {
    insertMessage: (username: string, content: string) =>
        db.insert(schema.messages)
            .values({ username, content })
            .returning()
            .get(),

    getRecent: (before: number = 2147483647, limit: number = MESSAGE_PAGE_SIZE) =>
        db.select()
            .from(schema.messages)
            .where(lt(schema.messages.id, before))
            .orderBy(desc(schema.messages.id))
            .limit(limit)
            .all()
            .reverse(),

    insertUser: (username: string, password: string) =>
        db.insert(schema.users)
            .values({ username, password })
            .returning()
            .get(),

    getUserById: (id: number) =>
        db.select()
            .from(schema.users)
            .where(eq(schema.users.id, id))
            .get(),

    getUserByUsername: (username: string) =>
        db.select()
            .from(schema.users)
            .where(eq(schema.users.username, username))
            .get(),

    bumpTokenVersion: (userId: number) =>
        db.update(schema.users)
            .set({ token_version: sql`${schema.users.token_version} + 1` })
            .where(eq(schema.users.id, userId))
            .returning()
            .get(),

    insertInviteCode: (code: string, created_by: number) =>
        db.insert(schema.inviteCodes)
            .values({ code, created_by })
            .onConflictDoNothing()
            .returning()
            .get(),

    getInviteCode: (code: string) =>
        db.select()
            .from(schema.inviteCodes)
            .where(eq(schema.inviteCodes.code, code))
            .get(),

    getAvailableInvite: (code: string) =>
        db.select({
            code: schema.inviteCodes.code,
            invited_by_username: schema.users.username
        })
            .from(schema.inviteCodes)
            .innerJoin(schema.users, eq(schema.inviteCodes.created_by, schema.users.id))
            .where(and(
                eq(schema.inviteCodes.code, code),
                isNull(schema.inviteCodes.used_by)
            ))
            .get(),

    insertUserWithInvite: (username: string, password: string, code: string, avatar?: AvatarData) =>
        db.transaction((tx) => {
            const user = tx.insert(schema.users)
                .values({ username, password })
                .returning()
                .get()

            const invite = tx.update(schema.inviteCodes)
                .set({ used_by: user.id })
                .where(and(
                    eq(schema.inviteCodes.code, code),
                    isNull(schema.inviteCodes.used_by)
                ))
                .returning()
                .get()

            if (!invite) {
                throw new Error("INVITE_CLAIM_FAILED")
            }

            if (avatar) {
                tx.insert(schema.profiles)
                    .values({ user_id: user.id, avatar: JSON.stringify(avatar) })
                    .run()
            }

            return user
        }),

    claimInviteCode: (code: string, userId: number) =>
        db.update(schema.inviteCodes)
            .set({ used_by: userId })
            .where(and(
                eq(schema.inviteCodes.code, code),
                isNull(schema.inviteCodes.used_by)
            ))
            .returning()
            .get(),

    getUserCount: () =>
        db.select({ count: sql<number>`count(*)` })
            .from(schema.users)
            .get()?.count ?? 0,

    getProfile: (username: string) => {
        const row = db.select({ avatar: schema.profiles.avatar })
            .from(schema.profiles)
            .innerJoin(schema.users, eq(schema.profiles.user_id, schema.users.id))
            .where(eq(schema.users.username, username))
            .get()
        if (!row) return null
        return parseAvatarData(row.avatar)
    },

    upsertProfile: (user_id: number, avatar: AvatarData) =>
        db.insert(schema.profiles)
            .values({ user_id, avatar: JSON.stringify(avatar) })
            .onConflictDoUpdate({
                target: schema.profiles.user_id,
                set: {
                    avatar: JSON.stringify(avatar),
                    updated_at: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
                }
            })
            .returning()
            .get(),

    // Permissions
    getUserPermissions: (user_id: number) =>
        db.select()
            .from(schema.userPermissions)
            .where(eq(schema.userPermissions.user_id, user_id))
            .get(),

    upsertUserPermissions: (user_id: number, permissions: Partial<{
        can_ban_users: number
        can_delete_messages: number
        can_leave_notes: number
        can_manage_invites: number
    }>) =>
        db.insert(schema.userPermissions)
            .values({ user_id, ...permissions })
            .onConflictDoUpdate({
                target: schema.userPermissions.user_id,
                set: permissions
            })
            .returning()
            .get(),

    // Banning
    banUser: (userId: number, bannedBy: number, reason?: string) =>
        db.update(schema.users)
            .set({
                is_banned: 1,
                banned_reason: reason ?? null,
                banned_by: bannedBy,
                banned_at: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
            })
            .where(eq(schema.users.id, userId))
            .returning()
            .get(),

    unbanUser: (userId: number) =>
        db.update(schema.users)
            .set({
                is_banned: 0,
                banned_reason: null,
                banned_by: null,
                banned_at: null
            })
            .where(eq(schema.users.id, userId))
            .returning()
            .get(),

    // Message moderation
    deleteMessage: (messageId: number, deletedBy: number, reason?: string) =>
        db.update(schema.messages)
            .set({
                deleted_at: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
                deleted_by: deletedBy,
                deleted_reason: reason ?? null
            })
            .where(eq(schema.messages.id, messageId))
            .returning()
            .get(),

    addAdminNote: (messageId: number, notedBy: number, note: string) =>
        db.update(schema.messages)
            .set({
                admin_note: note,
                admin_note_by: notedBy,
                admin_note_at: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
            })
            .where(eq(schema.messages.id, messageId))
            .returning()
            .get(),
}

if (process.env.SEED_ADMIN === "true") {
    const initialAdminUsername = process.env.INITIAL_ADMIN_USERNAME
    const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD

    if (!initialAdminUsername || !initialAdminPassword) {
        throw new Error("SEED_ADMIN=true requires INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD")
    }

    const hashedPassword = await Bun.password.hash(initialAdminPassword)
    db.insert(schema.users)
        .values({
            username: initialAdminUsername,
            password: hashedPassword,
            is_admin: 1
        })
        .onConflictDoUpdate({
            target: schema.users.username,
            set: {
                password: hashedPassword,
                is_admin: 1
            }
        })
        .run()

    console.log(`Admin user '${initialAdminUsername}' seeded.`)
}

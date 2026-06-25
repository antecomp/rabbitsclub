import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { join } from "path"
import { and, desc, eq, isNull, lt, sql } from "drizzle-orm"
import * as schema from "./schema"
import type { AvatarData } from "../schemas/profiles.schema"
import { MESSAGE_PAGE_SIZE } from "../../../../config"
import parseAvatarData from "~/util/parseAvatarData"

const dbPath = process.env.DB_PATH ?? join(import.meta.dir, "../../chat.db")
const migrationsPath = process.env.MIGRATIONS_PATH ?? join(import.meta.dir, "../../migrations")
const sqlite = new Database(dbPath, { create: true })
sqlite.run("PRAGMA journal_mode = WAL")

export const db = drizzle(sqlite, { schema })

// Auto-apply pending migrations on startup
migrate(db, { migrationsFolder: migrationsPath });

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

    getUserByUsername: (username: string) =>
        db.select()
            .from(schema.users)
            .where(eq(schema.users.username, username))
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

    insertUserWithInvite: (username: string, password: string, code: string) =>
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
            .get()
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

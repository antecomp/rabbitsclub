import { sqliteTable, text, integer, type AnySQLiteColumn } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"


const timestamps = {
    created_at: text("created_at").notNull()
        .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
}

export const users = sqliteTable("users", {
    id:       integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    is_admin: integer("is_admin").notNull().default(0),
    token_version: integer("token_version").notNull().default(0),

    is_banned:     integer("is_banned").notNull().default(0),
    banned_reason: text("banned_reason"),
    banned_at:     text("banned_at"),
    banned_by:     integer("banned_by").references((): AnySQLiteColumn => users.id),
    ...timestamps
})

export const messages = sqliteTable("messages", {
    id:             integer("id").primaryKey({ autoIncrement: true }),
    content:        text("content").notNull(),

    user_id:        integer("user_id").notNull().references(() => users.id),

    deleted_at:     text("deleted_at"),
    deleted_by:     integer("deleted_by").references(() => users.id),
    deleted_reason: text("deleted_reason"),
    deleted_kind:   text("deleted_kind", { enum: ['user', 'moderator'] }),

    edited_at:      text("edited_at"),

    moderation_note:          text("moderation_note"),
    moderation_note_author:   integer("moderation_note_author").references(() => users.id),
    moderation_note_at:       text("moderation_note_at"),
    ...timestamps
})

export const inviteCodes = sqliteTable("invite_codes", {
    id:         integer("id").primaryKey({ autoIncrement: true }),
    code:       text("code").notNull().unique(),
    used_by:    integer("used_by").references(() => users.id),
    created_by: integer("created_by").notNull().references(() => users.id),
    ...timestamps
})

export const profiles = sqliteTable("profiles", {
    user_id:    integer("user_id").primaryKey().references(() => users.id),
    avatar:     text("avatar"),
    updated_at: text("updated_at").notNull()
        .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
})

export const userPermissions = sqliteTable("user_permissions", {
    user_id:             integer("user_id").primaryKey().references(() => users.id),
    can_ban_users:       integer("can_ban_users").notNull().default(0),
    can_delete_messages: integer("can_delete_messages").notNull().default(0),
    // can_edit_messages:   integer("can_edit_messages").notNull().default(0),
    can_leave_notes:     integer("can_leave_notes").notNull().default(0),
    can_manage_invites:  integer("can_manage_invites").notNull().default(0),
})
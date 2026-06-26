import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
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
    ...timestamps
})

export const messages = sqliteTable("messages", {
    id:       integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull(),
    content:  text("content").notNull(),
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

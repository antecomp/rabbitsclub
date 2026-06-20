import { Database } from "bun:sqlite"

import { join } from "path"
import type { Message } from "./schemas/messages.schema";
import { type InviteCode, type User } from "./schemas/users.schema";
import type { AvatarData } from "./schemas/profiles.schema";

const db = new Database(join(import.meta.dir, "../chat.db"), { create: true })

// Enable WAL for concurrent reads (needed for multiuser chat, ofc).
db.run("PRAGMA journal_mode = WAL");

db.run(`
    CREATE TABLE IF NOT EXISTS messages (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        username    TEXT NOT NULL,
        content     TEXT NOT NULL,
        created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        username    TEXT NOT NULL UNIQUE,
        password    TEXT NOT NULL,
        created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        is_admin    INTEGER NOT NULL DEFAULT 0
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS invite_codes (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        code        TEXT NOT NULL UNIQUE,
        used_by     INTEGER REFERENCES users(id),
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        created_by  INTEGER NOT NULL REFERENCES users(id)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
        user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        avatar      TEXT NOT NULL DEFAULT '{}',
        updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
`)

const queries = {
    insertMessage: db.prepare<Message, { $username: string, $content: string }>(`
        INSERT INTO messages (username, content)
        VALUES ($username, $content)
        RETURNING *
    `),
    getRecent: db.prepare<Message, { $before: number, $limit: number }>(`
        SELECT * FROM messages
        WHERE id < $before
        ORDER BY id DESC
        LIMIT $limit
    `),
    insertUser: db.prepare<User, { $username: string, $password: string }>(`
        INSERT INTO users (username, password)
        VALUES ($username, $password)
        RETURNING *
    `),
    getUserByUsername: db.prepare<User, { $username: string }>(`
        SELECT * FROM users WHERE username = $username
    `),
    addInviteCode: db.prepare<InviteCode, { $code: string, $created_by: number }>(`
        INSERT OR IGNORE INTO invite_codes (code, created_by) VALUES ($code, $created_by) RETURNING *
    `),
    getInviteCode: db.prepare<InviteCode, { $code: string }>(`
        SELECT * FROM invite_codes WHERE code = $code
    `),
    claimInviteCode: db.prepare<InviteCode, { $code: string, $userId: number }>(`
        UPDATE invite_codes SET used_by = $userId WHERE code = $code AND used_by IS NULL RETURNING id
    `),
    getUserCount: db.prepare<{ count: number }, []>(`
        SELECT COUNT(*) AS count FROM users
    `),
    getProfile: db.prepare<{ user_id: number, avatar: string }, { $username: string }>(`
        SELECT profiles.user_id, profiles.avatar 
        FROM profiles 
        JOIN users ON profiles.user_id = users.id
        WHERE users.username = $username
    `),
    upsertProfile: db.prepare<{ user_id: number, avatar: string, updated_at: string }, { $user_id: number, $avatar: string }>(`
        INSERT INTO profiles (user_id, avatar) VALUES ($user_id, $avatar)
        ON CONFLICT (user_id) DO UPDATE SET 
            avatar = excluded.avatar,
            updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        RETURNING *
    `)
}

export const actions = {
    insertMessage: (username: string, content: string) =>
        queries.insertMessage.get({ $username: username, $content: content }),
    getRecent: (before: number = 2147483647, limit: number = 50) =>
        queries.getRecent.all({ $before: before, $limit: limit }).reverse(),
    insertUser: (username: string, password: string) =>
        queries.insertUser.get({ $username: username, $password: password }),
    getUserByUsername: (username: string) =>
        queries.getUserByUsername.get({ $username: username }),
    insertInviteCode: (code: string, created_by: number) =>
        queries.addInviteCode.get({ $code: code, $created_by: created_by }),
    getInviteCode: (code: string) =>
        queries.getInviteCode.get({ $code: code }),
    claimInviteCode: (code: string, userId: number) =>
        queries.claimInviteCode.get({ $code: code, $userId: userId }),
    getUserCount: () =>
        queries.getUserCount.get()?.count ?? 0,
    getProfile: (username: string) => {
        const row = queries.getProfile.get({ $username: username })
        if (!row) return null
        // change to return more as needed...
        return JSON.parse(row.avatar) as AvatarData
    },
    upsertProfile: (user_id: number, avatar: AvatarData) =>
        queries.upsertProfile.get({ $user_id: user_id, $avatar: JSON.stringify(avatar) })
};

// Seed in root user invite
actions.insertInviteCode("ADMIN", 1);

// Manully elevate an admin for now
db.run(`UPDATE users SET is_admin = 1 WHERE username = 'R46617'`)

console.log("db init");

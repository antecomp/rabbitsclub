import { Database } from "bun:sqlite"

import { join } from "path"
import type { Message } from "./schemas/messages.schema";
import { type InviteCode, type User } from "./schemas/users.schema";

const db = new Database(join(import.meta.dir, "../chat.db"), { create: true })

// Enable WAL for concurrent reads (needed for multiuser chat, ofc).
db.run("PRAGMA journal_mode = WAL");

db.run(`
    CREATE TABLE IF NOT EXISTS messages (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        username    TEXT NOT NULL,
        content     TEXT NOT NULL,
        created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        username    TEXT NOT NULL UNIQUE,
        password    TEXT NOT NULL,
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        is_admin    INTEGER NOT NULL DEFAULT 0
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS invite_codes (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        code        TEXT NOT NULL UNIQUE,
        used_by     INTEGER REFERENCES users(id),
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        created_by  TEXT
    )
`);

const queries = {
    insertMessage: db.prepare<Message, { $username: string, $content: string }>(`
        INSERT INTO messages (username, content)
        VALUES ($username, $content)
        RETURNING *
    `),
    getRecent: db.prepare<Message, []>(`
        SELECT * FROM messages
        ORDER BY created_at DESC
        LIMIT 50
    `),
    insertUser: db.prepare<User, { $username: string, $password: string }>(`
        INSERT INTO users (username, password)
        VALUES ($username, $password)
        RETURNING *
    `),
    getUserByUsername: db.prepare<User, { $username: string }>(`
        SELECT * FROM users WHERE username = $username
    `),
    addInviteCode: db.prepare<InviteCode, { $code: string }>(`
        INSERT OR IGNORE INTO invite_codes (code) VALUES ($code)
    `),
    getInviteCode: db.prepare<InviteCode, { $code: string }>(`
        SELECT * FROM invite_codes WHERE code = $code
    `),
    claimInviteCode: db.prepare<InviteCode, { $code: string, $userId: number }>(`
        UPDATE invite_codes SET used_by = $userId WHERE code = $code AND used_by IS NULL RETURNING id
    `)
}

export const actions = {
    insertMessage: (username: string, content: string) =>
        queries.insertMessage.get({ $username: username, $content: content }),
    getRecent: () =>
        queries.getRecent.all().reverse(),
    insertUser: (username: string, password: string) =>
        queries.insertUser.get({ $username: username, $password: password }),
    getUserByUsername: (username: string) =>
        queries.getUserByUsername.get({ $username: username }),
    insertInviteCode: (code: string) =>
        queries.addInviteCode.get({ $code: code }),
    getInviteCode: (code: string) =>
        queries.getInviteCode.get({ $code: code }),
    claimInviteCode: (code: string, userId: number) =>
        queries.claimInviteCode.get({ $code: code, $userId: userId })
};

// Manually seed some in for now.
["RABBIT-001", "RABBIT-002", "RABBIT-003"].forEach(preseedCode => {
    actions.insertInviteCode(preseedCode);
});

// Manully elevate an admin fir now
db.run(`UPDATE users SET is_admin = 1 WHERE username = 'R46617'`)

console.log("db init");
import { Database } from "bun:sqlite"

import { join } from "path"
import type { Message } from "./schemas/messages.schema";
import type { User } from "./schemas/users.schema";

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
        created_at  TEXT NOT NULL DEFAULT (datetime('now'))
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
        queries.getUserByUsername.get({ $username: username })
}

console.log("db init");
import { Database } from "bun:sqlite"

import { join } from "path"
import type { Message } from "./schemas/messages.schema";

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

const queries = {
    insertMessage: db.prepare<Message, {$username: string, $content: string}>(`
        INSERT INTO messages (username, content)
        VALUES ($username, $content)
        RETURNING *
    `),
    getRecent: db.prepare<Message, []>(`
        SELECT * FROM messages
        ORDER BY created_at DESC
        LIMIT 50
    `)
}

export const actions = {
    insertMessage: (username: string, content: string) =>
        queries.insertMessage.get({ $username: username, $content: content }),
    getRecent: () =>
        queries.getRecent.all().reverse()
}

console.log("db init");
import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { join } from "path"
import * as schema from "./schema"

const dbPath = process.env.DB_PATH ?? join(import.meta.dir, "../../chat.db")
const migrationsPath = process.env.MIGRATIONS_PATH ?? join(import.meta.dir, "../../migrations")
const sqlite = new Database(dbPath, { create: true })
sqlite.run("PRAGMA journal_mode = WAL")

export const db = drizzle(sqlite, { schema })

// Auto-apply pending migrations on startup
migrate(db, { migrationsFolder: migrationsPath });


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

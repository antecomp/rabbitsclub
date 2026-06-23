import { defineConfig } from "drizzle-kit"
import { join } from "path"

const dbPath = process.env.DB_PATH ?? join(__dirname, "chat.db")

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./migrations",
    dialect: "sqlite",
    dbCredentials: { url: dbPath }
})
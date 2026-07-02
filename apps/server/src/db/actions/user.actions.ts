import { eq, sql } from "drizzle-orm";
import { db } from "..";
import * as schema from "../schema";

export default {
    insertUser: (username: string, password: string) => db.insert(schema.users)
        .values({ username, password })
        .returning()
        .get(),

    getUserById: (id: number) => db.select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .get(),

    getUserByUsername: (username: string) => db.select()
        .from(schema.users)
        .where(eq(schema.users.username, username))
        .get(),

    getUserCount: () => db.select({ count: sql<number> `count(*)` })
        .from(schema.users)
        .get()?.count ?? 0,
}
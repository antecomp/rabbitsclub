import { eq, sql } from "drizzle-orm";
import { db } from "..";
import * as schema from "../schema";

export default {
    bumpTokenVersion: (userId: number) => db.update(schema.users)
        .set({ token_version: sql`${schema.users.token_version} + 1` })
        .where(eq(schema.users.id, userId))
        .returning()
        .get(),
}
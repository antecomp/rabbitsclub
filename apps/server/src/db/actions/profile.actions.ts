import { eq, sql } from "drizzle-orm";
import type { AvatarData } from "~/schemas/profiles.schema";
import parseAvatarData from "~/util/parseAvatarData";
import { db } from "..";
import * as schema from "../schema";

export default {
    getProfile: (username: string) => {
        const row = db.select({ avatar: schema.profiles.avatar })
            .from(schema.profiles)
            .innerJoin(schema.users, eq(schema.profiles.user_id, schema.users.id))
            .where(eq(schema.users.username, username))
            .get()
        if (!row) return null
        return parseAvatarData(row.avatar)
    },

    upsertProfile: (user_id: number, avatar: AvatarData) => db.insert(schema.profiles)
        .values({ user_id, avatar: JSON.stringify(avatar) })
        .onConflictDoUpdate({
            target: schema.profiles.user_id,
            set: {
                avatar: JSON.stringify(avatar),
                updated_at: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
            }
        })
        .returning()
        .get(),
}
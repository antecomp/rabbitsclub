import { eq, sql } from 'drizzle-orm';
import type { AvatarSchemaData } from '~/schemas/profiles.schema';
import parseAvatarData from '~/util/parseAvatarData';
import { db } from '..';
import * as schema from '../schema';
import { TIME_FORMAT } from '../time';

export default {
    getProfile: (user_id: number) => {
        const row = db.select({ avatar: schema.profiles.avatar })
            .from(schema.profiles)
            .where(eq(schema.profiles.user_id, user_id))
            .get();
        if (!row) return null;
        return parseAvatarData(row.avatar);
    },

    upsertProfile: (user_id: number, avatar: AvatarSchemaData) => db.insert(schema.profiles)
        .values({ user_id, avatar: JSON.stringify(avatar) })
        .onConflictDoUpdate({
            target: schema.profiles.user_id,
            set: {
                avatar: JSON.stringify(avatar),
                updated_at: sql`(strftime(${TIME_FORMAT}, 'now'))`
            }
        })
        .returning()
        .get()
};

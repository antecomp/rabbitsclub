import { db } from "..";
import { lt, desc, eq, sql } from "drizzle-orm";
import * as schema from "../schema"
import { MESSAGE_PAGE_SIZE } from "#config";

export default {
    insertMessage: (user_id: number, content: string) =>
        db.insert(schema.messages)
            .values({ user_id, content })
            .returning()
            .get(),

    getRecent: (before: number = 2147483647, limit: number = MESSAGE_PAGE_SIZE) => 
        db.select()
            .from(schema.messages)
            .where(lt(schema.messages.id, before))
            .orderBy(desc(schema.messages.id))
            .limit(limit)
            .all()
            .reverse(),

    // Message moderation
    deleteMessage: (messageId: number, deletedBy: number, reason?: string) => 
        db.update(schema.messages)
            .set({
                deleted_at: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
                deleted_by: deletedBy,
                deleted_reason: reason ?? null
            })
            .where(eq(schema.messages.id, messageId))
            .returning()
            .get(),

    addAdminNote: (messageId: number, notedBy: number, note: string) => 
        db.update(schema.messages)
            .set({
                admin_note: note,
                admin_note_by: notedBy,
                admin_note_at: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
            })
            .where(eq(schema.messages.id, messageId))
            .returning()
            .get(),
}
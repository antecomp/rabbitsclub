import { eq, and, isNull } from "drizzle-orm";
import type { AvatarData } from "~/schemas/profiles.schema";
import { db } from "..";
import * as schema from "../schema";

export default {
    insertInviteCode: (code: string, created_by: number) => db.insert(schema.inviteCodes)
        .values({ code, created_by })
        .onConflictDoNothing()
        .returning()
        .get(),

    getInviteCode: (code: string) => db.select()
        .from(schema.inviteCodes)
        .where(eq(schema.inviteCodes.code, code))
        .get(),

    getAvailableInvite: (code: string) => db.select({
        code: schema.inviteCodes.code,
        invited_by_username: schema.users.username
    })
        .from(schema.inviteCodes)
        .innerJoin(schema.users, eq(schema.inviteCodes.created_by, schema.users.id))
        .where(and(
            eq(schema.inviteCodes.code, code),
            isNull(schema.inviteCodes.used_by)
        ))
        .get(),

    insertUserWithInvite: (username: string, password: string, code: string, avatar?: AvatarData) => db.transaction((tx) => {
        const user = tx.insert(schema.users)
            .values({ username, password })
            .returning()
            .get()

        const invite = tx.update(schema.inviteCodes)
            .set({ used_by: user.id })
            .where(and(
                eq(schema.inviteCodes.code, code),
                isNull(schema.inviteCodes.used_by)
            ))
            .returning()
            .get()

        if (!invite) {
            throw new Error("INVITE_CLAIM_FAILED")
        }

        if (avatar) {
            tx.insert(schema.profiles)
                .values({ user_id: user.id, avatar: JSON.stringify(avatar) })
                .run()
        }

        return user
    }),

    claimInviteCode: (code: string, userId: number) => db.update(schema.inviteCodes)
        .set({ used_by: userId })
        .where(and(
            eq(schema.inviteCodes.code, code),
            isNull(schema.inviteCodes.used_by)
        ))
        .returning()
        .get(),

}
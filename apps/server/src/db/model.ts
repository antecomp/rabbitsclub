import { spreads } from "./utils"
import * as schema from "./schema"

// todo document
export const model = {
    insert: spreads({
        users:             schema.users,
        messages:          schema.messages,
        inviteCodes:       schema.inviteCodes,
        profiles:          schema.profiles,
        userPermissions:   schema.userPermissions
    }, "insert"),
    select: spreads({
        users:             schema.users,
        messages:          schema.messages,
        inviteCodes:       schema.inviteCodes,
        profiles:          schema.profiles,
        userPermissions:   schema.userPermissions
    }, "select")
} as const
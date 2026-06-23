import { spreads } from "./utils"
import * as schema from "./schema"

export const model = {
    insert: spreads({
        users:       schema.users,
        messages:    schema.messages,
        inviteCodes: schema.inviteCodes,
        profiles:    schema.profiles
    }, "insert"),
    select: spreads({
        users:       schema.users,
        messages:    schema.messages,
        inviteCodes: schema.inviteCodes,
        profiles:    schema.profiles
    }, "select")
} as const
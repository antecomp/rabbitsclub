import { t } from "elysia"
import { model } from "../db/model"

/**
 * Runtime schema for a user record backed by the users table.
 * Extracted type: User
 */
export const UserSchema = t.Object(model.select.users);
export type User = typeof UserSchema['static'];

/**
 * Runtime schema for an invite code record backed by the inviteCodes table.
 * Extracted type: InviteCode
 */
export const InviteCodeSchema = t.Object(model.select.inviteCodes);
export type InviteCode = typeof InviteCodeSchema['static'];

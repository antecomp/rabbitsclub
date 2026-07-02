import { t } from "elysia";
import { model } from "~/db/model";

export const UserPermissionsSchema = t.Object(model.select.userPermissions);
export type UserPermissions = typeof UserPermissionsSchema['static'];
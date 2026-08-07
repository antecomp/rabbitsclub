import Elysia from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserPermissionsSchema } from "~/schemas/moderation.schema";
import { actions } from "~/db/actions";
import { ErrorSchema } from "~/schemas/generic.schema";

export const adminRoutes = new Elysia({ prefix: '/admin' })
    .use(authMiddleware)
    .patch("/users/:id/permissions", ({ params, body: permissions, status }) => {
        const targetid = Number(params.id);

        if (!targetid)
            return status(400, { message: "Invalid user id" });

        if (!actions.users.getUserById(targetid))
            return status(404, { message: "User not found" });

        const updated = actions.moderation.upsertUserPermissions(targetid, permissions);
        if (!updated) return status(500, { message: "Unable to update permissions" });

        // Only surface permissions in schema rep for resp
        const { user_id, ...storedPermissions } = updated;
        return storedPermissions;
    }, {
        useAdmin: true,
        body: UserPermissionsSchema,
        response: {
            400: ErrorSchema,
            404: ErrorSchema,
            500: ErrorSchema
        }
    })
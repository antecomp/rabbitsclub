import Elysia, { t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserPermissionsSchema } from "~/schemas/moderation.schema";
import { actions } from "~/db/actions";
import { ErrorSchema } from "~/schemas/generic.schema";
import mapObject from "~/util/mapObject";

export const adminRoutes = new Elysia({ prefix: '/admin' })
    .use(authMiddleware)
    .patch("/users/:id/permissions", ({ params, body, status }) => {
        if (Object.keys(body).length === 0) {
            return status(400, { message: "At least one permission is required" });
        }

        // Permissions for db rep
        const permissions = mapObject(body, Number);

        const targetid = Number(params.id);

        if(!targetid)
            return status(400, {message: "Invalid user id"});

        if (!actions.users.getUserById(targetid)) 
            return status(404, { message: "User not found" });

        const updated = actions.moderation.upsertUserPermissions(targetid, permissions);
        if (!updated) return status(500, { message: "Unable to update permissions" });

        // Only surface permissions in schema rep for resp
        const { user_id, ...storedPermissions } = updated;
        return mapObject(storedPermissions, Boolean);
    }, {
        useAdmin: true,
        body: t.Partial(UserPermissionsSchema),
        response: {
            400: ErrorSchema,
            404: ErrorSchema,
            500: ErrorSchema
        }
    })
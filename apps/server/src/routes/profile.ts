import Elysia from "elysia"
import { authMiddleware } from "../middleware/auth.middleware"
import { AvatarDataSchema } from "../schemas/profiles.schema"
import { actions } from "../db"
import { t } from "elysia"
import { ErrorSchema } from "../schemas/generic.schema"

export const profileRoutes = new Elysia({ prefix: "/profile" })
    .use(authMiddleware)
    .get("/:username", ({ params: { username }, status }) => {
        const avatar = actions.getProfile(username);
        if(!avatar) return status(404, { message: "Profile not found" });
        return avatar;
    }, {
        useAuth: true,
        response: {
            200: t.Nullable(AvatarDataSchema),
            404: ErrorSchema
        }
    })
    .put("/avatar", ({ body, user }) => {
        actions.upsertProfile(user.id, body)
        return { success: true }
    }, {
        useAuth: true,
        body: AvatarDataSchema,
        response: {
            200: t.Object({ success: t.Boolean() })
        }
    })

import Elysia from "elysia"
import { authMiddleware } from "../middleware/auth.middleware"
import { AvatarDataSchema } from "../schemas/profiles.schema"
import { actions } from "../db"
import { t } from "elysia"

export const profileRoutes = new Elysia({ prefix: "/profile" })
    .use(authMiddleware)
    .get("/:username", ({ params: { username } }) => {
        return actions.getProfile(username)
    }, {
        useAuth: true,
        response: {
            200: t.Nullable(AvatarDataSchema)
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
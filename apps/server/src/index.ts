import { Elysia, t } from "elysia"
import { cors } from "@elysiajs/cors"
import { chatRoutes } from "./routes/chat"
import { authRoutes } from "./routes/auth"
import { adminRoutes } from "./routes/admin"
import { actions } from "./db/actions"
import { profileRoutes } from "./routes/profile"
import { moderationRoutes } from "./routes/moderation"

const app = new Elysia()
    .use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }))
    .use(authRoutes)
    .use(chatRoutes)
    .use(adminRoutes)
    .use(moderationRoutes)
    .use(profileRoutes)
    .get("/health", () => ({ status: "ok" }), {
        response: t.Object({
            status: t.String()
        })
    })
    .get("/usercount", () => actions.getUserCount())
    .listen(process.env.PORT ?? 3000)

export type App = typeof app

console.log(`Server running at http://localhost:${app.server!.port}`)

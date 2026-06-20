import { Elysia, t } from "elysia"
import { cors } from "@elysiajs/cors"
import "./db"
import { chatRoutes } from "./routes/chat"
import { authRoutes } from "./routes/auth"
import { adminRoutes } from "./routes/admin"
import { actions } from "./db"
import { profileRoutes } from "./routes/profile"

const app = new Elysia()
    .use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }))
    .use(authRoutes)
    .use(chatRoutes)
    .use(adminRoutes)
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

import { Elysia, t } from "elysia"
import { cors } from "@elysiajs/cors"
import "./db"
import { chatRoutes } from "./routes/chat"
import { authRoutes } from "./routes/auth"

const app = new Elysia()
    .use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }))
    .use(authRoutes)
    .use(chatRoutes)
    .get("/health", () => ({ status: "ok" }), {
        response: t.Object({
            status: t.String()
        })
    })
    .listen(process.env.PORT ?? 3000)

export type App = typeof app

console.log(`Server running at http://localhost:${app.server!.port}`)

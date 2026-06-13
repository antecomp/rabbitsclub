import { Elysia, t } from "elysia"
import { cors } from "@elysiajs/cors"

const app = new Elysia()
    .use(cors({ origin: process.env.CLIENT_ORIGIN }))
    .get("/health", () => ({ status: "ok" }), {
        response: t.Object({
            status: t.String()
        })
    })
    .listen(process.env.PORT ?? 3000)

export type App = typeof app

console.log(`Server running at http://localhost:${app.server!.port}`)

import { Elysia } from "elysia";

const app = new Elysia()
    .get("/api/health", () => ({status: "ok"}))
    .listen(process.env.PORT ?? 3000)

console.log(`Server running at https://localhost:${app.server!.port}`);
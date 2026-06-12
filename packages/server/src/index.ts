import { Elysia } from "elysia";

const app = new Elysia()
    .get("/api/health", () => (JSON.stringify({ status: "ok" })))
    .listen(process.env.PORT ?? 3000);

// For Eden E2E Type Safety.
export type App = typeof app;

console.log(`Server running at https://localhost:${app.server!.port}`);
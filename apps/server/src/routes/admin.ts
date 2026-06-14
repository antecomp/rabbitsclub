import Elysia from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";

export const adminRoutes = new Elysia()
    .use(authMiddleware)
    .get("/secret", ({user}) => {
        return {
            content: "You are an admin, only you should see this.",
            you: user
        }
    }, {
        useAdmin: true
    })
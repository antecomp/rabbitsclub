import Elysia from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";

export const adminRoutes = new Elysia({prefix: '/admin'})
    .use(authMiddleware)

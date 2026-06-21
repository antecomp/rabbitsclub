import Elysia, { t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { actions } from "../db";
import { ErrorSchema } from "~/schemas/users.schema";

export const adminRoutes = new Elysia({prefix: '/admin'})
    .use(authMiddleware)
    .post("/invite", ({body, user, status}) => {
        const existingCode = actions.getInviteCode(body.code);
        if(existingCode) return status(409, {message: "code already exists"});

        const invite = actions.insertInviteCode(body.code, user.id);
        if (!invite) return status(500, {message: "unable to create invite"});

        return {code: invite.code}
    }, {
        useAdmin: true,
        body: t.Object({
            code: t.String()
        }),
        response: {
            409: ErrorSchema,
            500: ErrorSchema
        }
    })

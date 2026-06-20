import Elysia, { t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { actions } from "../db";
import { ErrorSchema } from "~/schemas/users.schema";
import { HttpStatus } from "http-status-ts";

export const adminRoutes = new Elysia({prefix: '/admin'})
    .use(authMiddleware)
    .get("/secret", ({user}) => {
        return {
            content: "You are an admin, only you should see this.",
            you: user
        }
    }, {
        useAdmin: true
    })
    .post("/invite", ({body, user, status}) => {
        const existingCode = actions.getInviteCode(body.code);
        if(existingCode) return status(HttpStatus.CONFLICT, {message: "code already exists"});

        const invite = actions.insertInviteCode(body.code, user.id);
        if (!invite) return status(HttpStatus.INTERNAL_SERVER_ERROR, {message: "unable to create invite"});

        return {code: invite.code}
    }, {
        useAdmin: true,
        body: t.Object({
            code: t.String()
        }),
        response: {
            [HttpStatus.CONFLICT]: ErrorSchema,
            [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorSchema
        }
    })
import Elysia, { t } from 'elysia';
import { actions } from '~/db/actions';
import { authMiddleware } from '~/middleware/auth.middleware';
import { AuthorizationErrorSchema } from '~/schemas/auth.schema';
import { ErrorSchema } from '~/schemas/generic.schema';

export const inviteRoutes = new Elysia({ prefix: '/invites' })
    .use(authMiddleware)
    .post('/', ({ body, status, user }) => {
        const existingCode = actions.invites.getInviteCode(body.code);
        if (existingCode) return status(409, { message: 'code already exists' });

        const invite = actions.invites.insertInviteCode(body.code, user.id);
        if (!invite) return status(500, { message: 'unable to create invite' });

        return { code: invite.code };
    }, {
        usePermission: 'can_manage_invites',
        body: t.Object({
            code: t.String()
        }),
        response: {
            403: AuthorizationErrorSchema,
            409: ErrorSchema,
            500: ErrorSchema
        }
    });
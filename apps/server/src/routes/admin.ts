import Elysia from 'elysia';
import { authMiddleware } from '../middleware/auth.middleware';
import { UpdateUserPermissionsSchema } from '~/schemas/moderation.schema';
import { actions } from '~/db/actions';
import { ErrorSchema } from '~/schemas/generic.schema';
import { mapObject } from '~/util/mapObject';
import { createUserPermissions } from './moderation';

export const adminRoutes = new Elysia({ prefix: '/admin' })
    .use(authMiddleware)
    .get('/users/:id/permissions', ({ params, status }) => {
        const targetid = Number(params.id);

        if (!targetid)
            return status(400, { message: 'Invalid user id' });

        const targetUser = actions.users.getUserById(targetid);

        if (!targetUser)
            return status(404, { message: 'User not found' });

        const dbPermissions =
            actions.moderation.getUserPermissions(targetid);

        const { user_id: _userId, ...permissions } =
            dbPermissions ?? {
                user_id: targetid,
                ...createUserPermissions()
            };

        return mapObject(
            permissions,
            permission => targetUser.is_admin || permission
        );
    }, {
        useAdmin: true,
        response: {
            400: ErrorSchema,
            404: ErrorSchema,
            500: ErrorSchema
        }
    })
    .patch('/users/:id/permissions', ({ params, body: permissions, status }) => {
        const targetid = Number(params.id);

        if (!targetid)
            return status(400, { message: 'Invalid user id' });

        if (!actions.users.getUserById(targetid))
            return status(404, { message: 'User not found' });

        const updated = actions.moderation.upsertUserPermissions(targetid, permissions);
        if (!updated) return status(500, { message: 'Unable to update permissions' });

        // Only surface permissions in schema rep for resp
        const { user_id, ...storedPermissions } = updated;
        return storedPermissions;
    }, {
        useAdmin: true,
        body: UpdateUserPermissionsSchema,
        response: {
            400: ErrorSchema,
            404: ErrorSchema,
            500: ErrorSchema
        }
    });
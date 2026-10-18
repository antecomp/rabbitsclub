import Elysia from 'elysia';
import { authMiddleware } from '../middleware/auth.middleware';
import { AvatarDataSchema } from '../schemas/profiles.schema';
import { profiles } from '~/db/actions';
import { t } from 'elysia';
import { ErrorSchema } from '../schemas/generic.schema';

export const profileRoutes = new Elysia({ prefix: '/profile' })
    .use(authMiddleware)
    .get('/:id', ({ params: { id }, status }) => {
        const userId = Number(id);
        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return status(400, { message: 'Invalid user ID' });
        }

        const avatar = profiles.getProfile(userId);
        if(!avatar) return status(404, { message: 'Profile not found' });
        return avatar;
    }, {
        useAuth: true,
        response: {
            200: t.Nullable(AvatarDataSchema),
            400: ErrorSchema,
            404: ErrorSchema
        }
    })
    .put('/avatar', ({ body, user }) => {
        profiles.upsertProfile(user.id, body);
        return { success: true };
    }, {
        useAuth: true,
        body: AvatarDataSchema,
        response: {
            200: t.Object({ success: t.Boolean() })
        }
    });

import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { AuthCookieSchema, AuthErrorSchema, CurrentUserSchema, JWTSchema } from '../schemas/auth.schema';
import { authError, clearAuthCookie, isAuthFailure, validateAuthToken } from '../util/auth';

export const userRoutes = new Elysia({ prefix: '/users' })
    .use(jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET!,
        schema: JWTSchema
    }))
    .get('/me', async ({ jwt, cookie: { auth }, status }) => {
        if (!auth?.value) return null;

        const result = await validateAuthToken(jwt, auth.value);
        if (isAuthFailure(result)) {
            clearAuthCookie(auth);
            return status(401, authError(result.reason));
        }

        const { user } = result;
        return { id: user.id, username: user.username, is_admin: user.is_admin };
    }, {
        response: {
            200: t.Union([CurrentUserSchema, t.Null()]),
            401: AuthErrorSchema
        },
        cookie: AuthCookieSchema
    });

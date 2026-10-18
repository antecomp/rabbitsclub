import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { chatRoutes } from './routes/chat';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { adminRoutes } from './routes/admin';
import { users } from './db/actions';
import { profileRoutes } from './routes/profile';
import { moderationRoutes } from './routes/moderation';
import { messageRoutes } from './routes/messages';
import { inviteRoutes } from './routes/invites';
import openapi from '@elysia/openapi';
import { configure, getConsoleSink } from '@logtape/logtape';
import { elysiaLogger } from '@logtape/elysia';
import { AsyncLocalStorage } from 'node:async_hooks';

await configure({
    sinks: { console: getConsoleSink() },
    loggers: [
        { category: ['elysia'], sinks: ['console'], lowestLevel: 'info' }
    ],
    contextLocalStorage: new AsyncLocalStorage()
});

const app = new Elysia()
    .use(elysiaLogger({
        skip: ctx => ctx.path === '/health',
        category: 'elysia',
        context: true
    }))
    .use(openapi())
    .use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }))
    .use(authRoutes)
    .use(userRoutes)
    .use(chatRoutes)
    .use(messageRoutes)
    .use(adminRoutes)
    .use(moderationRoutes)
    .use(profileRoutes)
    .use(inviteRoutes)
    .get('/health', () => ({ status: 'ok' }), {
        response: t.Object({
            status: t.String()
        })
    })
    .get('/usercount', () => users.getUserCount())
    .listen(process.env.PORT ?? 3000);

export type App = typeof app;

console.log(`Server running at http://localhost:${app.server!.port}`);

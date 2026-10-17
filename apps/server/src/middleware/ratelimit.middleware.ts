import { rateLimit } from 'elysia-rate-limit';
import type { ErrorMessage } from '~/schemas/generic.schema';

export const DEFAULT_RATE_LIMIT = rateLimit({
    max: 10,
    duration: 1000 * 60,
    errorResponse: JSON.stringify(
        { message: 'Too many requests' } satisfies ErrorMessage
    ),
    scoping: 'scoped'
});
import { t } from 'elysia';

/** Generic error payload schema. */
export const ErrorSchema = t.Object({ message: t.String() });
export type ErrorMessage = typeof ErrorSchema['static'];

/** Generic request success response */
export const RequestResultSchema = t.Object({ success: t.Boolean() });
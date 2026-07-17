import { t } from "elysia"

/** Generic error payload schema. */
export const ErrorSchema = t.Object({ message: t.String() });

/** Generic request success response */
export const RequestResultSchema = t.Object({ success: t.Boolean() })
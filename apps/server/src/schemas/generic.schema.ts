import { t } from "elysia"

/** Generic error payload schema. */
export const ErrorSchema = t.Object({ message: t.String() });

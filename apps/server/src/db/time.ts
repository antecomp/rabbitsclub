import { sql } from "drizzle-orm"

// Keep this as a SQL literal because schema defaults cannot use bound parameters.
export const TIME_FORMAT = sql.raw("'%Y-%m-%dT%H:%M:%fZ'")

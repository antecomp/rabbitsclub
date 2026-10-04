import { getTableColumns } from 'drizzle-orm';
import { omitFields } from '~/util/omitFields';
import * as schema from '~/db/schema';

// this probably belongs under it's own actions file instead.
export const userPermissionColumns = omitFields(
    getTableColumns(schema.userPermissions),
    ['user_id'] as const
);
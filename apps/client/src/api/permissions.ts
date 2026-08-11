import { createResource } from 'solid-js';
import { api } from './backend';
import { user } from './user';
import { UserPermissions } from '~/schemas/moderation.schema';

export const [permissions, {
    refetch: refetchPermissions,
    mutate: mutatePermissions
}] = createResource(
    () => ({ userId: user()?.id }),
    ({ userId }) => {
        if (userId == null) return null;

        return api.moderation.permissions
            .get()
            .then(({ data }) => data ?? null);
    }
);

export const hasPermission = (permission: keyof UserPermissions) =>
    permissions()?.[permission] ?? false;
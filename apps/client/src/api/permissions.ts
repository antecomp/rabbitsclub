import { createEffect, createSignal } from 'solid-js';
import type { UserPermissions } from '~/schemas/moderation.schema';
import { user } from './user';
import { api } from './backend';

const [permissions, setPermissions] = createSignal<UserPermissions | null>(null);

createEffect(() => {
    const u = user();
    if (!u) {
        setPermissions(null);
        return;
    }

    void api.moderation.permissions.get().then(({ data }) => {
        setPermissions(data ?? null);
    })
})

export { permissions }

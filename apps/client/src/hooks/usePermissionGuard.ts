import { useNavigate } from '@solidjs/router';
import { createEffect, createMemo } from 'solid-js';
import type { UserPermissions } from '~/schemas/moderation.schema';
import { permissions } from '@/api/permissions';
import { user } from '@/api/user';

type Permission = keyof UserPermissions;

interface PermissionGuardOptions {
    mode?: 'any' | 'all'
    redirectTo?: string
}

/**
 * usePermissionGuard
 *
 * Hook that guards routes or components by user permissions.
 *
 * Parameters:
 * - required: permission key or array of permission keys from UserPermissions.
 * - options.mode: "any" (at least one) or "all" (default: all).
 * - options.redirectTo: path to redirect when access is denied (default: "/").
 *
 * Return value:
 * - A function that returns true when access is granted, false when denied,
 *   and undefined while loading.
 */
export default function usePermissionGuard(
    required: Permission | readonly Permission[],
    options: PermissionGuardOptions = {}
) {
    const navigate = useNavigate();
    const requiredPermissions =
        typeof required === 'string' ? [required] : required;

    const access = createMemo<boolean | undefined>(() => {
        if (user.loading || permissions.loading) return undefined;

        const current = permissions();
        if (!current) return false;

        const check = (permission: Permission) => current[permission];

        return options.mode === 'any'
            ? requiredPermissions.some(check)
            : requiredPermissions.every(check);
    });

    createEffect(() => {
        if (access() === false) {
            navigate(options.redirectTo ?? '/', { replace: true });
        }
    });

    // Also can be used to prevent rendering while loading or redirecting.
    return () => access() === true;
}
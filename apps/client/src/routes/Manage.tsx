import { createEffect, type ParentProps } from "solid-js"
import { Container } from "../styled/shared.styles";
import { useNavigate } from "@solidjs/router";
import { user } from "@/api/user";
import { type UserPermissions } from "~/schemas/moderation.schema";
import { permissions } from "@/api/permissions";

export const MANAGEMENT_PERMISSIONS: (keyof UserPermissions)[] = [
    'can_ban_users',
    'can_manage_invites'
];

export const hasManagementPermissions = () => {
    const perms = permissions()
    return !!perms && MANAGEMENT_PERMISSIONS.some(p => perms[p])
}

export default function Manage(props: ParentProps) {
    const navigate = useNavigate();

    createEffect(() => {
        // don't bump if we're just loading
        if (user.loading || permissions.loading) return;

        if (!hasManagementPermissions())
            navigate("/", { replace: true })
    })

    return <Container>
        {props.children}
    </Container>
}

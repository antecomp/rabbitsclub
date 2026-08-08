import { Show, type ParentProps } from "solid-js"
import { Container } from "../styled/shared.styles";
import { type UserPermissions } from "~/schemas/moderation.schema";
import usePermissionGuard from "@/hooks/usePermissionGuard";

export const MANAGEMENT_PERMISSIONS = [
    'can_ban_users',
    'can_manage_invites'
] as const satisfies (keyof UserPermissions)[];

export default function Manage(props: ParentProps) {
    const canAccess = usePermissionGuard(MANAGEMENT_PERMISSIONS, {
        mode: "any",
    })

    return (
        <Show when={canAccess()}>
            <Container>{props.children}</Container>
        </Show>
    )
}

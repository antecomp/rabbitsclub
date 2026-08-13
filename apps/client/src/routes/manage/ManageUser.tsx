import { api } from "@/api/backend";
import usePermissionGuard from "@/hooks/usePermissionGuard";
import { AuthForm, Divider, Subtitle, Title } from "@/styled/shared.styles";
import { useParams } from "@solidjs/router";
import { createResource, Show, Suspense } from "solid-js";
import { type ModerationUser } from "~/schemas/moderation.schema";

export default function ManageUser() {
    const canAccess = usePermissionGuard('can_ban_users', {
        redirectTo: '/manage'
    });

    const params = useParams<{ id: string }>();

    const [selectedUser] = createResource<ModerationUser | null>(
        () => {
            const id = Number(params.id);
            if (!id) return null;
            return api.moderation.user({ id: id })
                .get()
                .then(({ data }) => data ?? null);
        }
    )

    return (
        <Show when={canAccess()}>
            <Title>manage</Title>
            <Subtitle>User management</Subtitle>
            <Divider />
            <Suspense fallback={<div>Loading user data...</div>}>
                <AuthForm>
                    {JSON.stringify(selectedUser())}
                </AuthForm>
            </Suspense>
        </Show>
    );
}
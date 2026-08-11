import Footer from "@/components/Footer";
import Link from "@/components/Link";
import usePermissionGuard from "@/hooks/usePermissionGuard";
import { AuthForm, Divider, Subtitle, Title } from "@/styled/shared.styles";
import { Show } from "solid-js";

export default function ManageUsers() {
    const canAccess = usePermissionGuard('can_ban_users', {
        redirectTo: '/manage'
    });

    return (
        <Show when={canAccess()}>
            <Title>manage</Title>
            <Subtitle>User management</Subtitle>
            <Divider />
            <AuthForm>
                placeholder
                <Link href="/manage">[ BACK ]</Link>
            </AuthForm>
            <Footer>Select user to manage.</Footer>
        </Show>
    )
}
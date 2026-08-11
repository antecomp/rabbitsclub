import { api } from "@/api/backend";
import Footer from "@/components/Footer";
import Link from "@/components/Link";
import usePermissionGuard from "@/hooks/usePermissionGuard";
import { AuthForm, Divider, Subtitle, ThinDivider, Title } from "@/styled/shared.styles";
import { createResource, For, Show } from "solid-js";
import { styled } from "solid-styled-components";

const UserSelectionTable = styled('div')`
    width: 100%;
    height: 125px;
    overflow-y: auto;
    display: block;
    scrollbar-width: none;
`

const UserSelectionRowContainer = styled('div')`
    width: 100%;
    gap: 5px;
    display: flex;
    margin-bottom: 2px;

    span {
        background: lightgray;
        color: black;
        padding: 2px;
    }
`

const UserSelectionRowId = styled('span')`
    width: 3.5ch;
    text-align: right;
`

const UserSelectionRowUsername = styled('span')`
    flex-grow: 1;
`

function UserSelectionRow(
    // lmao
    props: Exclude<Awaited<ReturnType<typeof api.moderation.users.get>>['data'], null>[number]
) {
    return (
        <UserSelectionRowContainer>
            <UserSelectionRowId>{props.id}</UserSelectionRowId>
            <UserSelectionRowUsername>{props.username}</UserSelectionRowUsername>
        </UserSelectionRowContainer>
    )
}

export default function ManageUsers() {
    const canAccess = usePermissionGuard('can_ban_users', {
        redirectTo: '/manage'
    });

    const [users, refetch] = createResource(() => api.moderation.users.get().then(({ data }) => data ?? null))

    return (
        <Show when={canAccess()}>
            <Title>manage</Title>
            <Subtitle>User management</Subtitle>
            <Divider />
            <AuthForm>
                <UserSelectionTable>
                    <Show when={users()}>
                        <For each={users() ?? []}>
                            {user => <UserSelectionRow {...user} />}
                        </For>
                    </Show>
                </UserSelectionTable>
                <ThinDivider />
                <Link href="/manage">[ BACK ]</Link>
            </AuthForm>
            <Footer>Select user to manage.</Footer>
        </Show>
    )
}
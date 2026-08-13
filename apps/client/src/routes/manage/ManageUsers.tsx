import { api } from '@/api/backend';
import Footer from '@/components/Footer';
import Link from '@/components/Link';
import usePermissionGuard from '@/hooks/usePermissionGuard';
import { AuthForm, Divider, Subtitle, ThinDivider, Title } from '@/styled/shared.styles';
import HammerIcon from 'lucide-solid/icons/hammer';
import NotebookIcon from 'lucide-solid/icons/notebook';
import SendIcon from 'lucide-solid/icons/send';
import TrashIcon from 'lucide-solid/icons/trash';
import type { LucideIcon } from 'lucide-solid';
import { createResource, createSignal, For, Show } from 'solid-js';
import { styled } from 'solid-styled-components';
import { type UserPermissions } from '~/schemas/moderation.schema';
import { useNavigate } from '@solidjs/router';

// idk why I have to split it like this but whatever
const PERMISSION_KEYS = ['can_ban_users', 'can_delete_messages', 'can_leave_notes', 'can_manage_invites'] as const satisfies (keyof UserPermissions)[];
const PERM_ICON_MAP: Record<typeof PERMISSION_KEYS[number], LucideIcon> = {
    'can_ban_users': HammerIcon,
    'can_delete_messages': TrashIcon,
    'can_leave_notes': NotebookIcon,
    'can_manage_invites': SendIcon
};

const UserSelectionTable = styled('div')`
    width: 100%;
    height: 150px;
    overflow-y: auto;
    display: block;
    scrollbar-width: none;

    --cut: 10px;
    clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
`;

const UserSelectionRowContainer = styled('div')`
    width: 100%;
    gap: 2px;
    display: flex;
    margin-bottom: 3px;

    &:hover {
        text-decoration: underline;
        cursor: pointer;
    }

    span {
        background: lightgray;
        color: black;
        padding: 2px;
    }

    &:nth-of-type(even) span {
        background: #aaa;
    }
`;

const UserSelectionRowId = styled('span')`
    width: 3.5ch;
    text-align: right;
`;

const UserSelectionRowUsername = styled('span')`
    flex-grow: 1;
`;

const UserSelectionRowPermissions = styled('span')`
    width: fit-content;
`;

type ManageUser = Exclude<Awaited<ReturnType<typeof api.moderation.users.get>>['data'], null>[number];

function UserSelectionRow(props: ManageUser) {
    const navigate = useNavigate();

    return (
        <UserSelectionRowContainer onClick={() => navigate(`/manage/user/${props.id}`)}>
            <UserSelectionRowId>{props.id}</UserSelectionRowId>
            <UserSelectionRowUsername>{props.username}</UserSelectionRowUsername>
            <UserSelectionRowPermissions>
                <For each={PERMISSION_KEYS}>
                    {perm => {
                        const Icon = PERM_ICON_MAP[perm];
                        return <Icon color={props.permissions[perm] ? 'black' : 'gray'} size={18} stroke-width={1.5} />;
                    }}
                </For>
            </UserSelectionRowPermissions>
        </UserSelectionRowContainer>
    );
}

export default function ManageUsers() {
    const canAccess = usePermissionGuard('can_ban_users', {
        redirectTo: '/manage'
    });

    const [search, setSearch] = createSignal('');

    const [users] = createResource(() => api.moderation.users.get().then(({ data }) => data ?? null));

    return (
        <Show when={canAccess()}>
            <Title>manage</Title>
            <Subtitle>User management</Subtitle>
            <Divider />
            <AuthForm>
                <UserSelectionTable>
                    <Show when={users()}>
                        <For each={users()?.filter(user => user.username.toUpperCase().includes(search().toUpperCase())) ?? []}>
                            {user => <UserSelectionRow {...user} />}
                        </For>
                    </Show>
                </UserSelectionTable>
                <ThinDivider />
                <input type="text" value={search()} onInput={e => setSearch(e.target.value)} placeholder="search" />
                <Link href="/manage">[ BACK ]</Link>
            </AuthForm>
            <Footer>Select user to manage.</Footer>
        </Show>
    );
}
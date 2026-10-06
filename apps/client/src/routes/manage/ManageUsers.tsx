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
import partition from '@/util/partition';
import createFlatToggle from '@/components/toggles/FlatToggle';

export const PERM_ICON_MAP: Record<keyof UserPermissions, LucideIcon> = {
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

    &.admin {
        color: green;
        span {
            color: green;
        }
    }

    &.banned {
        color: red;
        span {
            color: red;
        }
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

const UserFilterContainer = styled('div')`
    display: grid;
    grid-template-columns: 15fr 8fr;
    width: 100%;

    .toggle-container {
        font-size: 13px;
        button {
            font-size: 13px;
        }
    }
`;

type ManageUser = Exclude<Awaited<ReturnType<typeof api.moderation.users.get>>['data'], null>[number];

function UserSelectionRow(user: ManageUser) {
    const navigate = useNavigate();

    return (
        <UserSelectionRowContainer
            // solid-styled overrides classList
            class={[
                user.is_banned && 'banned',
                user.is_admin && 'admin'
            ].filter(Boolean).join(' ')}
            onClick={() => navigate(`/manage/user/${user.id}`)}
        >
            <UserSelectionRowId>{user.id}</UserSelectionRowId>
            <UserSelectionRowUsername>{user.username}</UserSelectionRowUsername>
            <UserSelectionRowPermissions>
                <For each={Object.entries(PERM_ICON_MAP) as [keyof UserPermissions, LucideIcon][]}>
                    {([perm, Icon]) => (
                        <Icon 
                            color={user.permissions[perm] ? 'black' : 'gray'} 
                            size={18} 
                            stroke-width={1.5} 
                        />
                    )}
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

    const [toggle, filterSelection] = createFlatToggle(['all', 'banned', 'unbanned'], 'show who?');

    const userList = () => {
        const all = users();
        if (!all) return [];

        const filtered = all.filter(user =>
            user.username.toUpperCase()
                .includes(search().toUpperCase())
        );

        const [banned, unbanned] = partition(filtered, u => u.is_banned);

        switch (filterSelection()) {
            case 'all':
                return [...unbanned, ...banned];
            case 'banned':
                return banned;
            case 'unbanned':
                return unbanned;
        }
    };

    return (
        <Show when={canAccess()}>
            <Title>manage</Title>
            <Subtitle>User management</Subtitle>
            <Divider />
            <AuthForm as='div'>
                <UserSelectionTable>
                    <Show when={users()}>
                        <For each={userList()}>
                            {user => <UserSelectionRow {...user} />}
                        </For>
                    </Show>
                </UserSelectionTable>
                <ThinDivider />
                <UserFilterContainer>
                    <input tabindex='1' type="text" value={search()} onInput={e => setSearch(e.target.value)} placeholder="search" />
                    <div>
                        {toggle}
                    </div>
                </UserFilterContainer>
                <Link href="/manage">[ BACK ]</Link>
            </AuthForm>
            <Footer>Select user to manage.</Footer>
        </Show>
    );
}

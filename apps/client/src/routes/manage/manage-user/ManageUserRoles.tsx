import { For, Show, type VoidComponent } from 'solid-js';
import { InternalHashLink } from './InternalHashLink';
import { user } from '@/api/user';
import { ManageUserPresentationModel, ModerationActionProps } from '../manageuser.types';
import { styled } from 'solid-styled-components';
import { PERM_ICON_MAP } from '../ManageUsers';
import { type UserPermissions } from '~/schemas/moderation.schema';
import { LucideIcon } from 'lucide-solid';
import { permissions } from '@/api/permissions';
import createFlatToggle from '@/components/toggles/FlatToggle';


const RoleStack = styled('div')`
    display: flex;
    flex-direction: column;
`;

const RoleManageRow = styled('div')`
    display: flex;
    gap: 5px;
`

const PERM_DISPLAY_NAMES: Record<keyof UserPermissions, string> = {
    can_ban_users: 'BAN',
    can_delete_messages: 'DELETE',
    can_leave_notes: 'NOTES',
    can_manage_invites: 'INVITES'
}

const ManageUserRoles: VoidComponent<ManageUserPresentationModel> = (props) => {

    return <>
        <Show
            when={user()?.is_admin}
            fallback={<p>Cannot manage user roles</p>}
        >
            <RoleStack>
                <For each={Object.entries(PERM_ICON_MAP) as [keyof UserPermissions, LucideIcon][]}>
                    {([perm, Icon]) => {
                        // Will likely need to update this iterator so this is reactive.
                        const hasPerm = props.moderation.permissions[perm]

                        const [toggle, selection] = createFlatToggle(['on', 'off'], '', Number(!hasPerm))

                        return (
                            <RoleManageRow>
                                <Icon
                                    size={18}
                                    stroke-width={1.5}
                                />
                                <p>{PERM_DISPLAY_NAMES[perm]}</p>
                                <span style={{'flex-grow': '1'}}></span>
                                {toggle}
                            </RoleManageRow>
                        )
                    }}
                </For>
            </RoleStack>
            <br />
            <button>[ SAVE ]</button> 
        </Show>
        <br />
        <InternalHashLink href="/">[ BACK ]</InternalHashLink> <br />
    </>;
};

export default ManageUserRoles;

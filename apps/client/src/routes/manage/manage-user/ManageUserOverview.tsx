import { Show, VoidComponent } from 'solid-js';
import { ManageUserPresentationModel } from '../manageuser.types';
import { styled } from 'solid-styled-components';
import { ThinDivider } from '@/styled/shared.styles';
import { InternalHashLink } from './InternalHashLink';

export const StandingList = styled('div')`
    font-size: 13px;
    color: #222;
    border: solid #555 1px;
    background: #dadada;
    padding: 3px;
    border-radius: 2px;
    display: grid;
    grid-template-columns: max-content auto;

    span:nth-of-type(odd) {
        text-align: right;
    }

    span:nth-of-type(even) {
        padding-left: 10px;
    }
`;

const ManageUserOverview: VoidComponent<
    ManageUserPresentationModel & { onBack: () => void }
> = props => {
    return <>
        <StandingList>
            <span>admin:</span>
            <span>{String(props.moderation.isAdmin)}</span>
            <span>banned:</span>
            <span>
                {String(props.moderation.isBanned)}
                <Show when={props.moderation.ban.occurredAt}>
                    <br />
                    Ban by {props.moderation.ban.actor ?? '???'}
                    &nbsp;at {props.moderation.ban.occurredAt}
                    &nbsp;because: {props.moderation.ban.reason ?? '???'}
                    <Show when={props.moderation.unban.occurredAt}>
                        <br />
                        Unbanned by {props.moderation.unban.actor ?? '???'}
                        &nbsp;at {props.moderation.unban.occurredAt ?? '???'}
                        &nbsp;because {props.moderation.unban.reason ?? 'none'}
                    </Show>
                </Show>
            </span>
        </StandingList>
        <ThinDivider color='gray' style={{ 'margin': '5px 0px' }} />
        <InternalHashLink href="/ban">[ BAN ]</InternalHashLink> <br />
        <InternalHashLink href="/unban">[ UNBAN ]</InternalHashLink> <br />
        <InternalHashLink href="/roles">[ ROLES ]</InternalHashLink> <br />
        <button onClick={props.onBack}>[ BACK ]</button>
    </>;
};

export default ManageUserOverview;
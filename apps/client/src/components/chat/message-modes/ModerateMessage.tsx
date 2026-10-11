import createFlatToggle from '@/components/toggles/FlatToggle';
import { MessageActionComponent } from './MessageModes';
import { styled } from 'solid-styled-components';
import Link from '@/components/Link';
import { createMemo, createSignal } from 'solid-js';
import { MAX_MESSAGE_LENGTH } from '#config';
import { api } from '@/api/backend';
import { hasPermission } from '@/api/permissions';
import { useLocation } from '@solidjs/router';

const ModerateConfirmationMenu = styled('div')`
    display: flex;
    align-items: center;
    transform: translateY(10px);

    button { font-size: 12px; }
`;

const ModerateMessage: MessageActionComponent = props => {
    const location = useLocation();

    const actionToggle = createMemo(() => {
        const [first, ...rest] = (['WARN', 'DELETE'] as const).filter(action =>
            hasPermission(action === 'WARN' ? 'can_leave_notes' : 'can_delete_messages')
        );
        return first === undefined ? undefined : createFlatToggle([first, ...rest]);
    });
    const currentAction = () => actionToggle()?.[1]();

    const [reason, setReason] = createSignal('');

    function applyAction(event: SubmitEvent) {
        event.preventDefault();
        switch(currentAction()) {
            case 'DELETE':
                api.moderation.messages({ id: props.id }).delete({ reason: reason() });
                break;
            case 'WARN':
                api.moderation.messages({ id: props.id }).patch({ note: reason() });
                break;
            default:
                return;
        }
        props.closeSelf();
    }

    return (
        <div class='bubble mod-msg'>
            <div class='header'>
                <span>MODERATE</span>
            </div>
            {actionToggle()?.[0]}
            <form onSubmit={applyAction}>
                For: <input 
                    type="text" 
                    value={reason()} 
                    onInput={e => setReason(e.target.value)} 
                    maxlength={MAX_MESSAGE_LENGTH} 
                    style={{ 'background': 'transparent', 'outline': 'none', 'border': 'none', 'border-bottom': 'solid 1px black' }}
                />
                <ModerateConfirmationMenu>
                    <Link href={`/manage/user/${props.sender_id}`} state={{ origin: location.pathname + location.search }} style={{ 'font-size': '12px' }}>[MANAGE USER ↗]</Link>
                    <span style={{ 'flex-grow': 1 }}/>
                    <button type="button" onClick={props.closeSelf}>[ CANCEL ]</button>
                    <button type="submit" disabled={!currentAction()} >[ APPLY ]</button>
                </ModerateConfirmationMenu>
            </form>
        </div>
    );
};

export default ModerateMessage;

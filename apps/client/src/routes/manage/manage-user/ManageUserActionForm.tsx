import { useNavigate } from '@solidjs/router';
import { createSignal, type VoidComponent } from 'solid-js';
import type { ModerationActionProps } from '../manageuser.types';
import { InternalHashLink } from './InternalHashLink';

const ManageUserActionForm: VoidComponent<ModerationActionProps> = props => {
    const navigate = useNavigate();
    const [reason, setReason] = createSignal('');

    return <>
        <textarea 
            style={{ height: '60px' }} 
            value={reason()} 
            onInput={e => setReason(e.target.value)} 
            maxlength={60} 
            placeholder='Reason' 
        /> 
        <br />
        <button type='button' onClick={async () => {
            if (await props.onSubmit(reason())) navigate('/');
        }}>[ {props.label} ]</button> <br />
        <InternalHashLink href="/">[ BACK ]</InternalHashLink> <br />
    </>;
};

export default ManageUserActionForm;

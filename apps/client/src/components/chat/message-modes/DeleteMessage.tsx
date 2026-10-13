import './mode-styles.css';
import { MessageActionComponent } from './MessageModes';
import { api } from '@/api/backend';

const DeleteMessage: MessageActionComponent = props => {
    const deleteMessage = () => {
        api.messages({ id: props.id }).delete(); 
        props.closeSelf();
    };

    return (
        <div class="bubble message-mode delete-msg">
            <div class="message-mode-header message-mode-header--striped">
                <span>DELETE</span>
            </div>
            <span class="message-delete-content">
                {props.content}
            </span>
            <br/>
            <div class="message-confirmation-menu message-confirmation-menu--delete">
                <i class="message-delete-warning">This action cannot be undone.</i>
                <span class="message-action-spacer" />
                <button onClick={props.closeSelf}>[ CANCEL ]</button>
                <button onClick={deleteMessage}>[ DELETE ]</button>
            </div>
        </div>
    );
};

export default DeleteMessage;

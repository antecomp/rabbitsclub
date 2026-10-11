import './mode-styles.css';
import { createSignal } from 'solid-js';
import { MAX_MESSAGE_LENGTH } from '#config';
import { api } from '@/api/backend';
import { MessageActionComponent } from './MessageModes';

const EditMessage: MessageActionComponent = props => {
    const [content, setContent] = createSignal(props.content);
    const [saving, setSaving] = createSignal(false);

    const editMessage = async (event: SubmitEvent) => {
        event.preventDefault();
        if (saving() || !content().trim()) return;

        setSaving(true);
        try {
            const result = await api.messages({ id: props.id }).patch({ content: content() });
            if (result.error) {
                console.error('Unable to edit message, ', result.error);
                return;
            }
            props.closeSelf();
        } catch (err) {
            console.error('Unable to edit message, ', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div class="bubble edit-msg">
            <div class="header">
                <span>EDIT</span>
            </div>
            <form onSubmit={editMessage}>
                <input
                    type="text"
                    aria-label="Message content"
                    value={content()}
                    onInput={event => setContent(event.currentTarget.value)}
                    maxlength={MAX_MESSAGE_LENGTH}
                    disabled={saving()}
                    style={{ width: '100%', 'box-sizing': 'border-box' }}
                />
                <div style={{ 'text-align': 'right' }}>
                    <button type="button" onClick={props.closeSelf}>[ CANCEL ]</button>
                    <button type="submit" disabled={saving() || !content().trim()}>[ EDIT ]</button>
                </div>
            </form>
        </div>
    );
};

export default EditMessage;

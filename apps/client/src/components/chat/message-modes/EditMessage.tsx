import './mode-styles.css';
import { createSignal, onMount, Show } from 'solid-js';
import { MAX_MESSAGE_LENGTH } from '#config';
import { api } from '@/api/backend';
import { MessageActionComponent } from './MessageModes';

const EditMessage: MessageActionComponent = props => {
    let editInput: HTMLInputElement | undefined;
    const [content, setContent] = createSignal(props.content);
    const [saving, setSaving] = createSignal(false);

    onMount(() => editInput?.focus());

    const formTooltip = () => {
        if (content().length >= MAX_MESSAGE_LENGTH * 0.80) {
            return `( ${content().length} / ${MAX_MESSAGE_LENGTH} )`;
        }
    };

    const canSubmit = () => !saving() && !!content().trim() && content().length <= MAX_MESSAGE_LENGTH;

    const editMessage = async (event: SubmitEvent) => {
        event.preventDefault();
        if (!canSubmit()) return;

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
        <div class="bubble message-mode edit-msg">
            <div class="message-mode-header">
                <span>EDIT</span>
            </div>
            <form onSubmit={editMessage}>
                <input
                    ref={editInput}
                    type="text"
                    aria-label="Message content"
                    value={content()}
                    onInput={event => {
                        const value = event.currentTarget.value.slice(0, MAX_MESSAGE_LENGTH);
                        event.currentTarget.value = value;
                        setContent(value);
                    }}
                    maxlength={MAX_MESSAGE_LENGTH}
                    disabled={saving()}
                    class="message-mode-input"
                />
                <div class="message-confirmation-menu message-confirmation-menu--centered">
                    <Show when={formTooltip()}>
                        <span class="message-edit-counter">
                            {formTooltip()}
                        </span>
                    </Show>
                    <span class="message-action-spacer" />
                    <button type="button" onClick={props.closeSelf}>[ CANCEL ]</button>
                    <button type="submit" disabled={!canSubmit()}>[ EDIT ]</button>
                </div>
            </form>
        </div>
    );
};

export default EditMessage;

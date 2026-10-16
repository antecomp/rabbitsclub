import pfp_placeholder from '@/assets/ui/pfp_placeholder.png';
import './messages.css';

import { loadAvatarForUser } from '@/avatar/avatarCache';

import { type UserChatMessage } from '@/types/message.type';
import { format } from 'date-fns';
import { createMemo, createResource, createSignal, For, Show } from 'solid-js';
import { ACTIONS, MessageAction } from './message-modes/MessageModes';
import { Dynamic } from 'solid-js/web';
import DeletedMessage from './DeletedMessage';
import { messageGeometryClass } from './messageGeometry';

export type MessageProps = UserChatMessage & { isOwn: boolean };

function MessageContent(props: MessageProps) {
    const createdAt = new Date(props.created_at);

    const fullDate = format(createdAt, 'dd.MM.yy HH:mm');

    return (
        <div class='bubble'>
            <div class="timestamp">
                <span>{fullDate}</span>
            </div>
            <Show when={props.moderation_note}>
                <span class="message-moderation-note">[ {props.moderation_note} ]</span>
                <br />
            </Show>
            {props.content}
        </div>
    );
}

export default function ChatMessage(props: MessageProps) {

    const [mode, setMode] = createSignal<MessageAction | null>(null);

    const activeMode = createMemo(() => {
        const key = mode();
        if (key === null) return null;

        return ACTIONS[key].condition(props) ? key : null;
    });
    const activeAction = () => {
        const key = activeMode();
        return key === null ? undefined : ACTIONS[key];
    };

    const [avatarSrc] = createResource(
        () => props.sender_id,
        loadAvatarForUser,
        { initialValue: pfp_placeholder }
    );

    const deletedState = () => props.is_deleted && props.deleted_kind;

    return (
        <Show when={!deletedState()} fallback={<DeletedMessage {...props} />}>
            <div
                class="message-row"
                classList={{
                    'message-row--action': activeMode() !== null,
                    'message-row--moderating': activeMode() === 'mod'
                }}
            >
                <div
                    class={`message ${messageGeometryClass}`}
                    classList={{
                        'message-incoming': !props.isOwn,
                        'message-outgoing': props.isOwn
                    }}
                >
                    <Show when={!props.isOwn}>
                        <div class='message-tag'>
                            {props.username}
                        </div>
                    </Show>
                    <div class="pfp">
                        <img src={avatarSrc()} />
                    </div>
                    <Show
                        when={activeAction()}
                        keyed
                        fallback={<MessageContent {...props}></MessageContent>}
                    >
                        {action => (
                            <Dynamic
                                component={action.component}
                                {...props}
                                closeSelf={() => setMode(null)}
                            />
                        )}
                    </Show>
                    <div class='message-menu'>
                        <For each={
                            Object.entries(ACTIONS)
                                .filter(
                                    ([, { condition }]) => condition(props)
                                ) as [MessageAction, typeof ACTIONS[MessageAction]][]
                        }>
                            {([key, act]) =>
                                <a
                                    classList={{ 'selected': activeMode() === key }}
                                    onClick={() => setMode(
                                        prev => prev === key ? null : key
                                    )}
                                >
                                    [ {act.name} ]
                                </a>
                            }
                        </For>
                    </div>
                </div>
            </div>
        </Show>
    );
}

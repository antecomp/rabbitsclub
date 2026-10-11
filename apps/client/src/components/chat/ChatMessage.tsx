import pfp_placeholder from '@/assets/ui/pfp_placeholder.png';
import './messages.css';

import { loadAvatarForUser } from '@/avatar/avatarCache';

import { type UserChatMessage } from "@/types/message.type";
import { format } from "date-fns";
import { createSignal, For, onMount, Show } from "solid-js";
import { ACTIONS, MessageAction } from './message-modes/MessageModes';
import { Dynamic } from 'solid-js/web';

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
                <span style={{ color: 'red' }}>[ {props.moderation_note} ]</span>
                <br />
            </Show>
            {props.content}
        </div>
    )
}

export default function ChatMessage(props: MessageProps) {

    const [mode, setMode] = createSignal<MessageAction | null>(null);

    const activeAction = () => {
        const key = mode();
        if (key === null) return undefined;

        const action = ACTIONS[key];
        return action.condition(props) ? action : undefined;
    }

    const [avatarSrc, setAvatarSrc] = createSignal(pfp_placeholder);
    onMount(async () => {
        const url = await loadAvatarForUser(props.username);
        setAvatarSrc(url);
    });

    return (
        <div class={`message-row a-${mode() ?? 'normal'}`}>
            <div
                classList={{
                    'message': true,
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
                    {(action) => (
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
                                classList={{ 'selected': mode() === key }}
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
    )
}

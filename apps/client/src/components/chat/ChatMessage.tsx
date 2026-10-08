import pfp_placeholder from '@/assets/ui/pfp_placeholder.png';
import './messages.css';

import { loadAvatarForUser } from '@/avatar/avatarCache';

import { type UserChatMessage } from "@/types/message.type";
import { format, formatDistanceToNow } from "date-fns";
import { createSignal, onMount, Show } from "solid-js";

export type MessageProps = UserChatMessage & { isOwn: boolean };

export default function ChatMessage(props: MessageProps) {
    const createdAt = new Date(props.created_at);
    const [now, setNow] = createSignal(Date.now());

    const niceDate = () => {
        now();
        return formatDistanceToNow(createdAt, { addSuffix: true });
    }

    const fullDate = format(createdAt, 'dd.MM.yy HH:mm');

    const [avatarSrc, setAvatarSrc] = createSignal(pfp_placeholder);
    onMount(async () => {
        const url = await loadAvatarForUser(props.username);
        setAvatarSrc(url);
    });

    return (
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
            <div class='bubble'>
                {props.content}
            </div>
        </div>
    )
}
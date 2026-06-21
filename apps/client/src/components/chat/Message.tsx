import pfp_placeholder from '@/assets/ui/pfp_placeholder.png';
import { format, formatDistanceToNow } from "date-fns";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { usePreferences } from "@/context/Preferences";
import { loadAvatarForUser } from "@/avatar/avatarCache";
import {
    MessageBody,
    MessageContainer,
    MessagePfpContainer,
    TimestampContainer,
    MessageContent,
    UsernameTag
} from "./Message.styles";

export default function Message(props: {
    username: string,
    content: string,
    created_at: string,
    isOwn?: boolean
}) {
    const { preferences } = usePreferences();
    const createdAt = new Date(props.created_at);
    const [now, setNow] = createSignal(Date.now());

    const interval = setInterval(() => setNow(Date.now()), 30000);
    onCleanup(() => clearInterval(interval));

    const niceDate = () => {
        now();
        return formatDistanceToNow(createdAt, { addSuffix: true });
    };

    const fullDate = format(createdAt, 'dd.MM.yy HH:mm');

    const [avatarSrc, setAvatarSrc] = createSignal(pfp_placeholder);
    onMount(async () => {
        const url = await loadAvatarForUser(props.username);
        setAvatarSrc(url);
    })

    return (
        <Show
            when={props.isOwn}
            fallback={(
                <Show
                    when={preferences.incomingOnRight}
                    fallback={(
                        <MessageContainer side="left" withUsername>
                            <MessagePfpContainer side="left" raised>
                                <img src={avatarSrc()} />
                            </MessagePfpContainer>
                            <UsernameTag side="left">{props.username}</UsernameTag>
                            <MessageBody side="left" variant="incoming">
                                <TimestampContainer align="right"><span class="dateinfo">{niceDate()}</span><span class="dateinfo">{fullDate}</span></TimestampContainer>
                                <MessageContent>{props.content}</MessageContent>
                            </MessageBody>
                        </MessageContainer>
                    )}
                >
                    <MessageContainer side="right" withUsername>
                        <MessagePfpContainer side="right" raised>
                            <img src={avatarSrc()} />
                        </MessagePfpContainer>
                        <UsernameTag side="right">{props.username}</UsernameTag>
                        <MessageBody side="right" variant="incoming">
                            <TimestampContainer align="left"><span class="dateinfo">{niceDate()}</span><span class="dateinfo">{fullDate}</span></TimestampContainer>
                            <MessageContent>{props.content}</MessageContent>
                        </MessageBody>
                    </MessageContainer>
                </Show>
            )}
        >
            <Show
                when={preferences.incomingOnRight}
                fallback={(
                    <MessageContainer side="right">
                        <MessageBody side="right" variant="outgoing">
                            <TimestampContainer align="left"><span class="dateinfo">{niceDate()}</span><span class="dateinfo">{fullDate}</span></TimestampContainer>
                            <MessageContent>{props.content}</MessageContent>
                        </MessageBody>
                        <MessagePfpContainer side="right">
                            <img src={avatarSrc()} />
                        </MessagePfpContainer>
                    </MessageContainer>
                )}
            >
                <MessageContainer side="left">
                    <MessageBody side="left" variant="outgoing">
                        <TimestampContainer align="right"><span class="dateinfo">{niceDate()}</span><span class="dateinfo">{fullDate}</span></TimestampContainer>
                        <MessageContent>{props.content}</MessageContent>
                    </MessageBody>
                    <MessagePfpContainer side="left">
                        <img src={avatarSrc()} />
                    </MessagePfpContainer>
                </MessageContainer>
            </Show>
        </Show>
    )
}

import pfp_placeholder from '../../assets/ui/pfp_placeholder.png';
import { format, formatDistanceToNow } from "date-fns";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { usePreferences } from "@/context/Preferences";
import { loadAvatarForUser } from "@/avatar/avatarCache";
import {
    IncomingLeftBody,
    IncomingLeftContainer,
    UsernameRight,
    UsernameLeft,
    IncomingLeftPfpContainer,
    IncomingRightBody,
    IncomingRightContainer,
    IncomingRightPfpContainer,
    OutgoingLeftBody,
    OutgoingLeftContainer,
    OutgoingLeftPfpContainer,
    OutgoingRightBody,
    OutgoingRightContainer,
    OutgoingRightPfpContainer,
    TimestampContainer,
    MessageContent
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
                        <IncomingLeftContainer>
                            <IncomingLeftPfpContainer>
                                <img src={avatarSrc()} />
                            </IncomingLeftPfpContainer>
                            <UsernameLeft>{props.username}</UsernameLeft>
                            <IncomingLeftBody>
                                <TimestampContainer align="right"><span class="dateinfo">{niceDate()}</span><span class="dateinfo">{fullDate}</span></TimestampContainer>
                                <MessageContent>{props.content}</MessageContent>
                            </IncomingLeftBody>
                        </IncomingLeftContainer>
                    )}
                >
                    <IncomingRightContainer>
                        <IncomingRightPfpContainer>
                            <img src={avatarSrc()} />
                        </IncomingRightPfpContainer>
                        <UsernameRight>{props.username}</UsernameRight>
                        <IncomingRightBody>
                            <TimestampContainer align="left"><span class="dateinfo">{niceDate()}</span><span class="dateinfo">{fullDate}</span></TimestampContainer>
                            <MessageContent>{props.content}</MessageContent>
                        </IncomingRightBody>
                    </IncomingRightContainer>
                </Show>
            )}
        >
            <Show
                when={preferences.incomingOnRight}
                fallback={(
                    <OutgoingRightContainer>
                        <OutgoingRightBody>
                            <TimestampContainer align="left"><span class="dateinfo">{niceDate()}</span><span class="dateinfo">{fullDate}</span></TimestampContainer>
                            <MessageContent>{props.content}</MessageContent>
                        </OutgoingRightBody>
                        <OutgoingRightPfpContainer>
                            <img src={avatarSrc()} />
                        </OutgoingRightPfpContainer>
                    </OutgoingRightContainer>
                )}
            >
                <OutgoingLeftContainer>
                    <OutgoingLeftBody>
                        <TimestampContainer align="right"><span class="dateinfo">{niceDate()}</span><span class="dateinfo">{fullDate}</span></TimestampContainer>
                        <MessageContent>{props.content}</MessageContent>
                    </OutgoingLeftBody>
                    <OutgoingLeftPfpContainer>
                        <img src={avatarSrc()} />
                    </OutgoingLeftPfpContainer>
                </OutgoingLeftContainer>
            </Show>
        </Show>
    )
}

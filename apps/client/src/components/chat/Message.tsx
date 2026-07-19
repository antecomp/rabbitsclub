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
    UsernameTag,
    DeletedMessageNote,
    MessageModerationNote,
    EditedMessageNote
} from "./Message.styles";
import { UserChatMessage } from '@/types/message.type';
import createMessageContextMenu from './MessageContextMenu';

export type Side = 'left' | 'right';
type Variant = 'incoming' | 'outgoing';

export type MessageProps = UserChatMessage & { isOwn: boolean }

export default function Message(props: MessageProps) {
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

    const isIncoming = () => !props.isOwn;
    const side = (): Side => {
        const isRight = isIncoming()
            ? preferences.incomingOnRight
            : !preferences.incomingOnRight;

        return isRight ? 'right' : 'left';
    };
    const timestampAlign = () => side() === 'right' ? 'left' : 'right';
    const variant = (): Variant => isIncoming() ? 'incoming' : 'outgoing';

    const messageContent = () => props.is_deleted
        ? <DeletedMessageNote>[ DELETED : {props.deleted_reason} ]</DeletedMessageNote>
        : <> {props.content} </>

    const MessageMenus = createMessageContextMenu({ ...props, side: side() });

    return (
        <MessageContainer side={side()} withUsername={isIncoming()}>
            <MessagePfpContainer side={side()} raised={isIncoming()}>
                <img src={avatarSrc()} />
            </MessagePfpContainer>
            <Show when={isIncoming()}>
                <UsernameTag side={side()}>{props.username}</UsernameTag>
            </Show>
            <MessageBody side={side()} variant={variant()}>
                <TimestampContainer align={timestampAlign()}>
                    <span class="dateinfo">{niceDate()}</span>
                    <span class="dateinfo">{fullDate}</span>
                </TimestampContainer>
                <Show when={props.moderation_note}>
                    <MessageModerationNote>
                        [ {props.moderation_note} ]
                    </MessageModerationNote>
                </Show>
                <MessageContent>{messageContent()}</MessageContent>
                <Show when={props.edited}>
                    <EditedMessageNote align={side()}>
                        (edited)
                    </EditedMessageNote>
                </Show>
                <MessageMenus.ContextMenu />
            </MessageBody>
            <MessageMenus.ExpandedMenu />
        </MessageContainer>
    )
}
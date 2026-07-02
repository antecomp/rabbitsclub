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
    ModerationActions
} from "./Message.styles";
import { UserChatMessage } from '@/types/message.type';
import { api } from '@/api/backend';
import { MAX_MESSAGE_LENGTH } from '#config';
import { permissions } from '@/api/permissions';

type Side = 'left' | 'right';
type Variant = 'incoming' | 'outgoing';

export default function Message(props: {
    isOwn?: boolean
} & UserChatMessage) {
    const { preferences } = usePreferences();
    const createdAt = new Date(props.created_at);
    const [now, setNow] = createSignal(Date.now());

    const [moderating, setModerating] = createSignal(false);
    const [reason, setReason] = createSignal("");

    // TODO change this to permissions check! (needs BE update)
    const openModerationMenu = () => {
        const perms = permissions();
        if (!perms) return;
        if (perms.can_leave_notes || perms.can_delete_messages) 
            setModerating(true);
    }

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

    return (
        <MessageContainer side={side()} withUsername={isIncoming()}>
            {/* TODO PROPER MESSAGE ACTIONS TOOLTIP TO REPLACE THIS WITH */}
            <MessagePfpContainer side={side()} raised={isIncoming()} onClick={openModerationMenu}>
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
                <MessageContent>{messageContent()}</MessageContent>
            </MessageBody>
            <Show when={moderating()}>
                {/* TODO MAKE THIS ITS OWN COMPONENT THAT TAKES IN NEEDED INFO */}
                <ModerationActions>
                    &gt; message moderation...
                    <br />
                    <input type="text" value={reason()} onInput={e => setReason(e.target.value)} maxlength={MAX_MESSAGE_LENGTH}/> <br/>
                    <button onClick={() => api.moderation.messages({id: props.id}).delete({reason: reason()})}>[ DELETE MESSAGE ]</button>
                    <button onClick={() => setModerating(false)}>[ CLOSE ]</button>
                </ModerationActions>
            </Show>
        </MessageContainer>
    )
}

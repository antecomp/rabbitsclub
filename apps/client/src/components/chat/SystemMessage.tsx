import type { SystemChatMessage } from '@/types/message.type';
import './messages.css';

/** Displays websocket lifecycle events as centered system messages in chat. */
export default function SystemMessage(props: {
    message: SystemChatMessage;
}) {
    const event = props.message.event;
    const content = props.message.content;

    const eventToMessage = ({
        user_joined: `${content} has joined`,
        user_left: `${content} has left`
    } satisfies Record<SystemChatMessage['event'], string>)[event];

    return (
        <div class="system-message">
            <span/>
            <p>&lt; {eventToMessage} &gt;</p>
            <span/>
        </div>
    );
}

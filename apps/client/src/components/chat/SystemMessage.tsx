import type { SystemChatMessage } from "@/types/message.type";
import { styled } from "solid-styled-components";
import { PFP_SIZE } from "./Message.styles";

const SystemMessageContainer = styled("div")`
    margin: 15px auto;
    max-width: min(420px, calc(100% - ${PFP_SIZE}));
    box-sizing: border-box;
    color: #5b5b5b;
    text-align: center;
    overflow-wrap: anywhere;
    display: flex;
    align-items: center;
    font-size: 0.9em;

    span {
        flex-grow: 1;
        height: 1px;
        background-color: #5b5b5b;
    }

    p {
        margin: 0 5px;
    }
`;

/** Displays websocket lifecycle events as centered system messages in chat. */
export default function SystemMessage(props: {
    message: SystemChatMessage;
}) {
    const event = props.message.event;
    const content = props.message.content;

    const eventToMessage = ({
        user_joined: `${content} has joined`,
        user_left: `${content} has left`
    } satisfies Record<SystemChatMessage['event'], string>)[event]

    return (
        <SystemMessageContainer>
            <span/>
                <p>&lt; {eventToMessage} &gt;</p>
            <span/>
        </SystemMessageContainer>
    );
}

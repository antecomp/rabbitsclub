import type { SystemChatMessage } from "@/types/message.type";
import { styled } from "solid-styled-components";
import { PFP_SIZE } from "./Message.styles";

const SystemMessageContainer = styled("div")`
    margin: 15px auto;
    max-width: min(420px, calc(100% - ${PFP_SIZE}));
    padding: 8px 12px;
    box-sizing: border-box;
    color: #5b5b5b;
    background: #ebebeb;
    border: 1px solid #5b5b5b;
    text-align: center;
    overflow-wrap: anywhere;
    font-style: italic;
    border-radius: 3px;
`;

export default function SystemMessage(props: {
    message: SystemChatMessage["message"];
}) {
    const event = props.message.event;
    const content = props.message.content;

    const eventToMessage = ({
        user_joined: `${content} has joined`,
        user_left: `${content} has left`
    } satisfies Record<SystemChatMessage['message']['event'], string>)[event]

    return (
        <SystemMessageContainer>
            {eventToMessage}
        </SystemMessageContainer>
    );
}

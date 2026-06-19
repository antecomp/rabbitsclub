import { styled } from "solid-styled-components"
import pfp_placeholder from '../../assets/placeholder.png';
import { format, formatDistanceToNow } from "date-fns";
import chatbox from '../../assets/chatbox.png';
import sentbox from '../../assets/sentbox.png';
import taghead from '../../assets/taghead.png';
import tagtail from '../../assets/tagtail.png';
import { createSignal, onCleanup } from "solid-js";

const PFP_SIZE = '40px';
const USERNAME_SIZE = '0.7rem';
const DATE_SIZE = '0.6rem';
const MESSAGE_MARGINS = '15px';
const PFP_GAP = '5px';

const MessageContainer = styled("div")`
    display: grid;
    grid-template-columns: minmax(0, 1fr) ${PFP_SIZE};
    margin: ${MESSAGE_MARGINS};
    margin-top: calc(${USERNAME_SIZE} + ${MESSAGE_MARGINS});
    position: relative;

    gap: ${PFP_GAP};

    image-rendering: pixelated;
`

const PfpContainer = styled("div")`
    grid-column: 2;
    grid-row: 1;

    img {
        display: block;
        width: 100%;
        transform: translateY(-${USERNAME_SIZE});
    }
`

const MessageBody = styled("div")`
    grid-column: 1;
    grid-row: 1;
    justify-self: end;
    width: fit-content;
    min-width: 150px;
    max-width: 100%;
    box-sizing: border-box;

    overflow-wrap: anywhere;
    text-align: right;
    
    background: #e5e5e5;
    background-clip: padding-box;
    border-image-slice: 10 10 6 5;
    border-image-width: 10px 10px 6px 5px;
    border-width: 10px 10px 6px 5px;
    border-image-outset: 0px 0px 0px 0px;
    border-image-repeat: stretch stretch;
    border-image-source: url(${chatbox});
    border-style: solid;

    padding-bottom: 8px;
    padding-left: 5px;

    &:hover span.dateinfo:first-child {
        display: none;
    }

    & span.dateinfo:first-child + span.dateinfo {
        display: none;
    }

    &:hover span.dateinfo:first-child + span.dateinfo {
        display: block;
    }
    
`

const SentMessageContainer = styled("div")`
    display: grid;
    grid-template-columns: ${PFP_SIZE} minmax(0, 1fr);
    margin: ${MESSAGE_MARGINS};
    position: relative;

    gap: ${PFP_GAP};

    image-rendering: pixelated;
`

const SentPfpContainer = styled("div")`
    grid-column: 1;
    grid-row: 1;

    img {
        display: block;
        width: 100%;
    }
`

const SentMessageBody = styled("div")`
    grid-column: 2;
    grid-row: 1;
    justify-self: start;
    width: fit-content;
    min-width: 150px;
    max-width: 100%;
    box-sizing: border-box;

    overflow-wrap: anywhere;
    text-align: left;

    background: #f7f7f7;
    background-clip: padding-box;
    border-image-slice: 10 5 6 10;
    border-image-width: 10px 5px 6px 10px;
    border-width: 10px 5px 6px 10px;
    border-image-outset: 0px 0px 0px 0px;
    border-image-repeat: stretch stretch;
    border-image-source: url(${sentbox});
    border-style: solid;

    padding-bottom: 8px;
    padding-right: 5px;

    &:hover span.dateinfo:first-child {
        display: none;
    }

    & span.dateinfo:first-child + span.dateinfo {
        display: none;
    }

    &:hover span.dateinfo:first-child + span.dateinfo {
        display: block;
    }
`

const TimestampContainer = styled("div")`
    font-size: ${DATE_SIZE};
    text-align: right;
    color: gray;
    transform: translate(2px, -4px);
`

const Username = styled(`div`)`
    position: absolute;
    right: calc(${PFP_SIZE} + ${PFP_GAP});
    top: -1px;
    font-size: ${USERNAME_SIZE};
    transform: translateY(-100%);
    background-color: #dcdcdc;
    border: solid #5b5b5b 1px;
    border-left: none;
    padding-right: 2px;

    &::before {
        content: url(${tagtail});
        position: absolute;
        top: -1px;
        left: 0px;
        z-index: 0;
        transform: translateX(-100%);
    }

    &::after {
        content: url(${taghead});
        position: absolute;
        top: -1px;
        right: -1px;
    }
`

const MessageContent = styled("div")`
    
`

export default function Message(props: {
    username: string,
    content: string,
    created_at: string,
    isOwn?: boolean
}) {
    const createdAt = new Date(props.created_at);
    const [now, setNow] = createSignal(Date.now());

    const interval = setInterval(() => setNow(Date.now()), 30000);
    onCleanup(() => clearInterval(interval));

    const niceDate = () => {
        now();
        return formatDistanceToNow(createdAt, { addSuffix: true });
    };

    const fullDate = format(createdAt, 'dd.MM.yy HH:mm');

    if (props.isOwn) {
        return (
            <SentMessageContainer>
                <SentMessageBody>
                    <TimestampContainer><span class="dateinfo">{niceDate()}</span><span class="dateinfo">{fullDate}</span></TimestampContainer>
                    <MessageContent>{props.content}</MessageContent>
                </SentMessageBody>
                <SentPfpContainer>
                    <img src={pfp_placeholder} />
                </SentPfpContainer>
            </SentMessageContainer>
        )
    }

    return (
        <MessageContainer>
            <PfpContainer>
                <img src={pfp_placeholder} />
            </PfpContainer>
            <Username>{props.username}</Username>
            <MessageBody>
                <TimestampContainer><span class="dateinfo">{niceDate()}</span><span class="dateinfo">{fullDate}</span></TimestampContainer>
                <MessageContent>{props.content}</MessageContent>
            </MessageBody>
        </MessageContainer>
    )
}

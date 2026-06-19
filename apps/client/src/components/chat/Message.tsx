import { styled } from "solid-styled-components"
import pfp_placeholder from '../../assets/placeholder.png';
import { formatDistanceToNow } from "date-fns";
import chatbox from '../../assets/chatbox.png';
import taghead from '../../assets/taghead.png';
import tagtail from '../../assets/tagtail.png';

const PFP_SIZE = '40px';
const USERNAME_SIZE = '0.7rem';
const DATE_SIZE = '0.6rem';
const MESSAGE_MARGINS = '15px';
const PFP_GAP = '5px';

const MessageContainer = styled("div")`
    display: grid;
    grid-template-columns: ${PFP_SIZE} auto;
    margin: ${MESSAGE_MARGINS};
    margin-top: calc(${USERNAME_SIZE} + ${MESSAGE_MARGINS});
    position: relative;

    gap: ${PFP_GAP};

    image-rendering: pixelated;
`

const PfpContainer = styled("div")`
    img {
        display: block;
        width: 100%;
        transform: translateY(-${USERNAME_SIZE});
    }
`

const MessageBody = styled("div")`
    /* width: min(350px, 80%); */
    width: fit-content;
    min-width: 250px;
    max-width: 80%;
    
    background: white;
    background-clip: padding-box;
    border-image-slice: 10 5 6 10;
    border-image-width: 10px 5px 6px 10px;
    border-width: 10px 5px 6px 10px;
    border-image-outset: 0px 0px 0px 0px;
    border-image-repeat: stretch stretch;
    border-image-source: url(${chatbox});
    border-style: solid;

    padding-bottom: 8px;
    padding-right: 5px;
    
`

const TimestampContainer = styled("div")`
    font-size: ${DATE_SIZE};
    text-align: right;
    color: gray;
    transform: translate(2px, -4px);
`

const Username = styled(`div`)`
    position: absolute;
    left: calc(${PFP_SIZE} + ${PFP_GAP});
    top: -1px;
    font-size: ${USERNAME_SIZE};
    transform: translateY(-100%);
    background-color: #ffffff;
    border: solid #5b5b5b 1px;
    border-right: none;
    padding-left: 2px;

    &::before {
        content: url(${taghead});
        position: absolute;
        top: -1px;
        left: -1px;
        z-index: 0;
    }

    &::after {
        content: url(${tagtail});
        position: absolute;
        top: -1px;
    }
`

const MessageContent = styled("div")`
    
`

export default function Message(props: {
    username: string,
    content: string,
    created_at: string
}) {
    return (
        <MessageContainer>
            <PfpContainer>
                <img src={pfp_placeholder} />
            </PfpContainer>
            <Username>{props.username}</Username>
            <MessageBody>
                <TimestampContainer>{formatDistanceToNow(new Date(props.created_at), {addSuffix: true})}</TimestampContainer>
                <MessageContent>{props.content}</MessageContent>
            </MessageBody>
        </MessageContainer>
    )
}
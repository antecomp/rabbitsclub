import { styled } from "solid-styled-components"
import pfp_placeholder from '../../assets/placeholder.png';
import { format, formatDistanceToNow } from "date-fns";
import chatbox from '../../assets/chatbox.png';
import chatbox_f from '../../assets/chatbox_f.png';
import sentbox from '../../assets/sentbox.png';
import sentbox_f from '../../assets/sentbox_f.png';
import taghead from '../../assets/taghead.png';
import taghead_f from '../../assets/taghead_f.png';
import tagtail from '../../assets/tagtail.png';
import tagtail_f from '../../assets/tagtail_f.png';
import { createSignal, onCleanup, Show } from "solid-js";
import { usePreferences } from "../../context/Preferences";
import { getAvatarUrl } from "../../avatar/createAvatarRenderer";

const PFP_SIZE = '50px';
const USERNAME_SIZE = '0.7rem';
const DATE_SIZE = '0.6rem';
const MESSAGE_MARGINS = '15px';
const PFP_GAP = '5px';

const IncomingRightContainer = styled("div")`
    display: grid;
    grid-template-columns: minmax(0, 1fr) ${PFP_SIZE};
    margin: ${MESSAGE_MARGINS};
    margin-top: calc(${USERNAME_SIZE} + ${MESSAGE_MARGINS});
    position: relative;

    gap: ${PFP_GAP};

    /* image-rendering: pixelated; */
`

const IncomingRightPfpContainer = styled("div")`
    grid-column: 2;
    grid-row: 1;

    img {
        display: block;
        width: 100%;
        transform: translateY(-${USERNAME_SIZE});
    }
`

const IncomingRightBody = styled("div")`
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

const IncomingLeftContainer = styled("div")`
    display: grid;
    grid-template-columns: ${PFP_SIZE} minmax(0, 1fr);
    margin: ${MESSAGE_MARGINS};
    margin-top: calc(${USERNAME_SIZE} + ${MESSAGE_MARGINS});
    position: relative;

    gap: ${PFP_GAP};

    /* image-rendering: pixelated; */
`

const IncomingLeftPfpContainer = styled("div")`
    img {
        display: block;
        width: 100%;
        transform: translateY(-${USERNAME_SIZE});
    }
`

const IncomingLeftBody = styled("div")`
    width: fit-content;
    min-width: 150px;
    max-width: 100%;
    box-sizing: border-box;

    overflow-wrap: anywhere;
    
    background: #e5e5e5;
    background-clip: padding-box;
    border-image-slice: 10 5 6 10;
    border-image-width: 10px 5px 6px 10px;
    border-width: 10px 5px 6px 10px;
    border-image-outset: 0px 0px 0px 0px;
    border-image-repeat: stretch stretch;
    border-image-source: url(${chatbox_f});
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

const OutgoingLeftContainer = styled("div")`
    display: grid;
    grid-template-columns: ${PFP_SIZE} minmax(0, 1fr);
    margin: ${MESSAGE_MARGINS};
    position: relative;

    gap: ${PFP_GAP};

    /* image-rendering: pixelated; */
`

const OutgoingLeftPfpContainer = styled("div")`
    grid-column: 1;
    grid-row: 1;

    img {
        display: block;
        width: 100%;
    }
`

const OutgoingLeftBody = styled("div")`
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

const OutgoingRightContainer = styled("div")`
    display: grid;
    grid-template-columns: minmax(0, 1fr) ${PFP_SIZE};
    margin: ${MESSAGE_MARGINS};
    position: relative;

    gap: ${PFP_GAP};

    /* image-rendering: pixelated; */
`

const OutgoingRightPfpContainer = styled("div")`
    grid-column: 2;
    grid-row: 1;

    img {
        display: block;
        width: 100%;
    }
`

const OutgoingRightBody = styled("div")`
    grid-column: 1;
    grid-row: 1;
    justify-self: end;
    width: fit-content;
    min-width: 150px;
    max-width: 100%;
    box-sizing: border-box;

    overflow-wrap: anywhere;
    text-align: right;

    background: #f7f7f7;
    background-clip: padding-box;
    border-image-slice: 10 10 6 5;
    border-image-width: 10px 10px 6px 5px;
    border-width: 10px 10px 6px 5px;
    border-image-outset: 0px 0px 0px 0px;
    border-image-repeat: stretch stretch;
    border-image-source: url(${sentbox_f});
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

const TimestampContainer = styled("div")<{align: 'right' | 'left'}>`
    font-size: ${DATE_SIZE};
    text-align: ${props => props.align};
    color: gray;
    transform: translate(2px, -4px);
`

const UsernameRight = styled(`div`)`
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

const UsernameLeft = styled(`div`)`
    position: absolute;
    left: calc(${PFP_SIZE} + ${PFP_GAP});
    top: -1px;
    font-size: ${USERNAME_SIZE};
    transform: translateY(-100%);
    background-color: #dcdcdc;
    border: solid #5b5b5b 1px;
    border-right: none;
    padding-left: 2px;

    &::before {
        content: url(${taghead_f});
        position: absolute;
        top: -1px;
        left: -1px;
        z-index: 0;
    }

    &::after {
        content: url(${tagtail_f});
        position: absolute;
        top: -1px;
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
    getAvatarUrl({
        head: 4,
        leftEye: "circle",
        rightEye: "circle",
        leftEyeOffset: {
            x: 0,
            y: 0
        },
        rightEyeOffset: {
            x: 0,
            y: 0
        }
    }).then(r => setAvatarSrc(r));

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

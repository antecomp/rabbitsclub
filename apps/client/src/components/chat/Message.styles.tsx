import { splitProps, type JSX } from "solid-js";
import { styled } from "solid-styled-components";

import chatbox from '@/assets/ui/chatbox.png?url&no-inline';
import chatbox_f from '@/assets/ui/chatbox_f.png?url&no-inline';
import sentbox from '@/assets/ui/sentbox.png?url&no-inline';
import sentbox_f from '@/assets/ui/sentbox_f.png?url&no-inline';
import taghead from '@/assets/ui/taghead.png?url&no-inline';
import taghead_f from '@/assets/ui/taghead_f.png?url&no-inline';
import tagtail from '@/assets/ui/tagtail.png?url&no-inline';
import tagtail_f from '@/assets/ui/tagtail_f.png?url&no-inline';

export const PFP_SIZE = '50px';
export const USERNAME_SIZE = '11.2px';
export const DATE_SIZE = '10px';
export const MESSAGE_MARGINS = '15px';
export const PFP_GAP = '5px';

type Side = 'left' | 'right';
type Variant = 'incoming' | 'outgoing';
type SideProps = { side: Side; };
type MessageContainerProps = JSX.HTMLAttributes<HTMLDivElement> & { side: Side; withUsername?: boolean; };
type MessagePfpContainerProps = JSX.HTMLAttributes<HTMLDivElement> & { side: Side; raised?: boolean; };
type MessageBodyProps = JSX.HTMLAttributes<HTMLDivElement> & { side: Side; variant: Variant; };
type UsernameTagProps = JSX.HTMLAttributes<HTMLDivElement> & SideProps;

const MessageContainerBase = (props: MessageContainerProps) => {
    const [, divProps] = splitProps(props, ["side", "withUsername"]);
    return <div {...divProps} />;
};

const MessagePfpContainerBase = (props: MessagePfpContainerProps) => {
    const [, divProps] = splitProps(props, ["side", "raised"]);
    return <div {...divProps} />;
};

const MessageBodyBase = (props: MessageBodyProps) => {
    const [, divProps] = splitProps(props, ["side", "variant"]);
    return <div {...divProps} />;
};

const UsernameTagBase = (props: UsernameTagProps) => {
    const [, divProps] = splitProps(props, ["side"]);
    return <div {...divProps} />;
};

const dateInfoHoverCss = `
    &:hover span.dateinfo:first-child {
        display: none;
    }

    & span.dateinfo:first-child + span.dateinfo {
        display: none;
    }

    &:hover span.dateinfo:first-child + span.dateinfo {
        display: block;
    }
`;

const bubbleAsset = (variant: Variant, side: Side) => {
    if (variant === 'incoming') {
        return side === 'right' ? chatbox : chatbox_f;
    }

    return side === 'left' ? sentbox : sentbox_f;
};

const sideCss = (side: Side) => {
    if (side === 'right') {
        return `
            grid-template-columns: minmax(0, 1fr) ${PFP_SIZE};
        `;
    }

    return `
        grid-template-columns: ${PFP_SIZE} minmax(0, 1fr);
    `;
};

const pfpSideCss = (side: Side) => {
    if (side === 'right') {
        return `
            grid-column: 2;
        `;
    }

    return `
        grid-column: 1;
    `;
};

const bodySideCss = (side: Side) => {
    if (side === 'right') {
        return `
            grid-column: 1;
            justify-self: end;
            text-align: left; /* consistenly left looks better */
            border-image-slice: 10 10 6 5;
            border-image-width: 10px 10px 6px 5px;
            border-width: 10px 10px 6px 5px;
            padding-left: 5px;
        `;
    }

    return `
        grid-column: 2;
        justify-self: start;
        text-align: left;
        border-image-slice: 10 5 6 10;
        border-image-width: 10px 5px 6px 10px;
        border-width: 10px 5px 6px 10px;
        padding-right: 5px;
    `;
};

export const MessagePfpContainer = styled(MessagePfpContainerBase) <MessagePfpContainerProps>`
    ${({ side }) => pfpSideCss(side)}
    grid-row: 1;

    img {
        display: block;
        width: 100%;
        transform: ${({ raised }) => raised ? `translateY(-${USERNAME_SIZE})` : 'none'};
        aspect-ratio: 1;
        object-fit: contain;
        -webkit-user-drag: none;
        user-select: none;
    }
`;

export const MessageBody = styled(MessageBodyBase) <MessageBodyProps>`
    ${({ side }) => bodySideCss(side)}
    grid-row: 1;
    width: fit-content;
    min-width: 150px;
    max-width: 100%;
    box-sizing: border-box;
    overflow-wrap: anywhere;
    background: ${({ variant }) => variant === 'incoming' ? '#e5e5e5' : '#f7f7f7'};
    background-clip: padding-box;
    border-image-outset: 0px 0px 0px 0px;
    border-image-repeat: stretch stretch;
    border-image-source: ${({ variant, side }) => `url(${bubbleAsset(variant, side)})`};
    border-style: solid;
    padding-bottom: 8px;
    /* keeps the message bubbles between the pfps */
    max-width: calc(100% - ${PFP_SIZE} - ${PFP_GAP});
    position: relative;
`;

export const TimestampContainer = styled("div") <{ align: 'right' | 'left'; }> `
    font-size: ${DATE_SIZE};
    text-align: ${props => props.align};
    color: gray;
    transform: translate(2px, -4px);
`;

export const EditedMessageNote = styled("div") <{align: 'right' | 'left'}>`
    font-size: ${DATE_SIZE};
    text-align: ${props => props.align};
    font-style: italic;
    color: gray;
    transform: translateY(4px);
`

export const UsernameTag = styled(UsernameTagBase) <UsernameTagProps>`
    position: absolute;
    ${({ side }) => side === 'right' ? `right: calc(${PFP_SIZE} + ${PFP_GAP});` : `left: calc(${PFP_SIZE} + ${PFP_GAP});`}
    top: -1px;
    font-size: ${USERNAME_SIZE};
    transform: translateY(-100%);
    background-color: #dcdcdc;
    border: solid #5b5b5b 1px;
    ${({ side }) => side === 'right' ? 'border-left: none; padding-right: 2px;' : 'border-right: none; padding-left: 2px;'}

    &::before {
        content: ${({ side }) => side === 'right' ? `url(${tagtail})` : `url(${taghead_f})`};
        position: absolute;
        top: -1px;
        left: ${({ side }) => side === 'right' ? '0px' : '-1px'};
        z-index: 0;
        transform: ${({ side }) => side === 'right' ? 'translateX(-100%)' : 'none'};
    }

    &::after {
        content: ${({ side }) => side === 'right' ? `url(${taghead})` : `url(${tagtail_f})`};
        position: absolute;
        top: -1px;
        right: ${({ side }) => side === 'right' ? '-1px' : 'auto'};
    }
`;

export const MessageContent = styled("div")`
    user-select: text;
`;

export const MessageModerationNote = styled("span")`
    color: orangered;
`

export const DeletedMessageNote = styled('span')`
    color: red;
`

export const MessageExpandedMenu = styled('div')`
    grid-column: 1 / -1;

    input {
        font-family: 'main';
        background: none;
        border: none;
        border-bottom: 1px solid gray;
                outline: none;
    }
`

export const MessageContextMenu = styled('div') <SideProps>`
    position: absolute;
    padding: 2px;
    font-size: 12px;
    button { font-size: 12px; }
    top: -10px;
    ${({ side }) => side === 'right'
        ? `left: -10px; text-align: right;`
        : `right: -10px; text-align: left;`
    }

    transform: ${({ side }) => side === 'right' ? 'translateX(-100%)' : 'translateX(100%)'};

    a {
        cursor: pointer;
    }

    a:hover {
        color: gray;
    }

    visibility: hidden;
`

export const MessageContainer = styled(MessageContainerBase) <MessageContainerProps>`
    display: grid;
    ${({ side }) => sideCss(side)}
    margin: ${MESSAGE_MARGINS};
    margin-top: ${({ withUsername }) => withUsername ? `calc(${USERNAME_SIZE} + ${MESSAGE_MARGINS})` : MESSAGE_MARGINS};
    position: relative;
    gap: ${PFP_GAP};
    ${dateInfoHoverCss}

    &:hover ${MessageContextMenu.class} {
        visibility: visible;
    }
`;
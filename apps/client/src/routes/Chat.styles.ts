import { styled } from "solid-styled-components";

export const MESSAGE_COLUMN_SIZE = '1fr';
export const ASIDE_COLUMN_SIZE = '120px';
export const CHAT_COLUMN_GAP = '10px';

export const ChatContainer = styled("div")`
    position: absolute;
    top: 5vh;
    left: 5vw;
    max-width: 580px;
    width: 70vw;
    height: 750px;
    display: flex;
    flex-direction: column;
    user-select: none;
    animation: flicker-in 0.3s steps(12, end) forwards;
`;

export const ChatBody = styled('div')`
    display: grid;
    grid-template-columns: minmax(0, ${MESSAGE_COLUMN_SIZE}) minmax(120px, ${ASIDE_COLUMN_SIZE});
    gap: ${CHAT_COLUMN_GAP};
    flex: 1;
    min-height: 0;
`;

export const Messages = styled('div')`
    position: relative;
    overflow: auto;
    min-width: 0;
    min-height: 0;

    &::-webkit-scrollbar {
        visibility: hidden;
    }
`;

export const SendInput = styled(`input`)`
    background: lightgray;
    border: none;
    font-family: 'main';
    font-size: 1rem;
    padding: 5px;
    outline: none;
    flex-grow: 1;
    clip-path: polygon(calc(100% - 5px) 0, 100% calc(0% + 5px), 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 0);

    &:hover, &:focus {
        background-color: #ddd;
    }

    &:focus + button {
        padding: 5px 20px;
    }
`;

export const SendForm = styled(`form`)`
    display: flex;
    margin-bottom: 10px;
    margin-top: 10px;
`;

export const SendButton = styled(`button`)`
    border: none;
    padding: 5px 25px;
    font-size: 1rem;
    background: lightgray;
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, calc(0% + 5px) calc(100% - 5px), calc(0% + 5px) calc(0% + 5px));

    transition: padding 0.1s linear;
    text-align: center;

    &:hover, &:focus {
        background-color: #ddd;
        padding: 5px 30px !important;
    }
`;

export const LoadMoreButton = styled('a')`
    width: 100%; 
    padding-top: 10px;
    display: block;
    cursor: pointer;
    text-align: center;

    &:hover {
        color: gray;
    }
`;

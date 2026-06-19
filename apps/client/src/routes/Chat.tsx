import { createEffect, createResource, createSignal, For, onCleanup, onMount, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { BE } from "../api"
import { refetchUser, user } from "../store"
import { MessageHistoryData } from "../types/message.type";
import Message from "../components/chat/Message";
import Footer from "../components/Footer";
import { styled } from "solid-styled-components";
import { Divider, Title } from "../styled/MainMenu";
import { playSoundOnce } from "../util/playSound";
import ping from '../assets/ping.mp3';

const ChatContainer = styled("div")`
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
`

// temp, will do better layout later.
const Messages = styled('div')`
    overflow: auto;
    &::-webkit-scrollbar {
        visibility: hidden;
    }
    /* margin-bottom: 5px; */
`

const SendInput = styled(`input`)`
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
`

const SendForm = styled(`form`)`
    display: flex;
    margin-bottom: 10px;
    margin-top: 10px;
`


const SendButton = styled(`button`)`
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
`

export default function Chat() {
    const [content, setContent] = createSignal("");
    const [whoisOnline, setWhoIsOnline] = createSignal<string[]>([]);
    let messagesEl: HTMLDivElement | undefined;

    const [messages, setMessages] = createSignal<MessageHistoryData>([]);
    const [hasMoreMessages, setHasMoreMessages] = createSignal(true);
    onMount(async () => {
        const { data } = await BE.messages.get({ query: {} });
        if (data) {
            setMessages(data);
            // todo: remove magic number (do the same on the BE too)
            setHasMoreMessages(data.length == 50);
        }
    });

    const loadMore = async () => {
        const oldest = messages()![0];
        if (!oldest) return;

        const { data } = await BE.messages.get({
            query: { before: String(oldest.id) }
        });
        if (!data) return;
        setMessages(prev => [...data, ...prev])
        setHasMoreMessages(data.length === 50)
    }

    let sub: ReturnType<typeof BE.ws.subscribe>

    onMount(() => {
        sub = BE.ws.subscribe()

        // Change this so we have system messages in there two but
        // with a flag to render them differently.
        sub.on("message", ({ data }) => {
            switch (data.type) {
                case 'user':
                    setMessages(prev => [...prev, data])
                    if (!document.hasFocus()) void playSoundOnce(ping);
                    break;
                case 'system':
                    // will add toasts later
                    console.log(data.content);
                    break;
                case 'online':
                    setWhoIsOnline(data.users)
                    break;
            }
        })

        onCleanup(() => sub.close())
    })

    const send = (e: SubmitEvent) => {
        e.preventDefault()
        if (!content() || !user()) return
        sub.send({ username: user()!.username, content: content() })
        setContent("")
    }

    // TODO: Disable when scrolled up enough & when LOAD MORE is clicked...
    createEffect(() => {
        messages();
        if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    })

    return (
        <ChatContainer>
            <header>
                <Title>chat</Title>
                <Divider />
            </header>
            <Messages ref={messagesEl}>
                <Show when={hasMoreMessages()}>
                    <button style={'width: 100%;'} onClick={loadMore}>[ LOAD MORE ]</button>
                </Show>
                <For each={messages()}>
                    {msg => Message(msg)}
                </For>
            </Messages>
            <Divider color={'gray'}/>
            <SendForm onsubmit={send}>
                <SendInput
                    value={content()}
                    onInput={e => setContent(e.target.value)}
                    placeholder="Message"
                />
                <SendButton type="submit">SEND</SendButton>
            </SendForm>
            <Footer>
                Type messages and press [SEND] or RETURN to transmit. <br />
                <span>You are {user()?.username}. Be kind.</span>
            </Footer>
        </ChatContainer>
    )
}

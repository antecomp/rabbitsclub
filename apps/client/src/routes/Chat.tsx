import { createEffect, createSignal, For, on, onCleanup, onMount, Show } from "solid-js"
import { BE } from "../api"
import { user } from "../store"
import { MessageHistoryData } from "../types/message.type";
import Message from "../components/chat/Message";
import Footer from "../components/Footer";
import { styled } from "solid-styled-components";
import { Divider, Title } from "../styled/MainMenu";
import { playSoundOnce } from "../util/playSound";
import ping from '../assets/ping.mp3';
import Aside from "../components/chat/Aside";

const MESSAGE_COLUMN_SIZE = '1fr';
const ASIDE_COLUMN_SIZE = '120px';
const CHAT_COLUMN_GAP = '10px';
const AUTO_SCROLL_THRESHOLD = 300;

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

const ChatBody = styled('div')`
    display: grid;
    grid-template-columns: minmax(0, ${MESSAGE_COLUMN_SIZE}) minmax(120px, ${ASIDE_COLUMN_SIZE});
    gap: ${CHAT_COLUMN_GAP};
    flex: 1;
    min-height: 0;
`

const Messages = styled('div')`
    position: relative;
    overflow: auto;
    min-width: 0;
    min-height: 0;

    &::-webkit-scrollbar {
        visibility: hidden;
    }
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

const LoadMoreButton = styled('a')`
    width: 100%; 
    padding-top: 10px;
    display: block;
    cursor: pointer;
    text-align: center;

    &:hover {
        color: gray;
    }
`

export default function Chat() {
    const [content, setContent] = createSignal("");
    const [whoisOnline, setWhoIsOnline] = createSignal<string[]>([]);
    let messagesEl: HTMLDivElement | undefined;
    let sendInputEl: HTMLInputElement | undefined;

    const [messages, setMessages] = createSignal<MessageHistoryData>([]);
    const [hasMoreMessages, setHasMoreMessages] = createSignal(true);
    const [autoScrollMessages, setAutoScrollMessages] = createSignal(true);
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

        setAutoScrollMessages(false);
        const previousScrollHeight = messagesEl?.scrollHeight ?? 0;
        const previousScrollTop = messagesEl?.scrollTop ?? 0;

        const { data } = await BE.messages.get({
            query: { before: String(oldest.id) }
        });
        if (!data) return;
        setMessages(prev => [...data, ...prev])
        setHasMoreMessages(data.length === 50)

        queueMicrotask(() => {
            if (!messagesEl) return;
            messagesEl.scrollTop = messagesEl.scrollHeight - previousScrollHeight + previousScrollTop;
        });
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
                    if (!document.hasFocus() || !autoScrollMessages()) void playSoundOnce(ping);
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

    const isEditableElement = (target: EventTarget | null) => {
        return target instanceof HTMLElement
            && !!target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
    }

    onMount(() => {
        const focusSendInputOnTyping = (e: KeyboardEvent) => {
            if (
                e.defaultPrevented
                || e.ctrlKey
                || e.metaKey
                || e.altKey
                || e.key == ' '
                || e.key.length !== 1
                || e.isComposing
                || !sendInputEl
                || document.activeElement === sendInputEl
                || isEditableElement(e.target)
            ) {
                return;
            }

            e.preventDefault();
            sendInputEl.focus();
            const start = sendInputEl.selectionStart ?? content().length;
            const end = sendInputEl.selectionEnd ?? start;
            const nextContent = `${content().slice(0, start)}${e.key}${content().slice(end)}`;
            setContent(nextContent);

            queueMicrotask(() => {
                const caretPosition = start + e.key.length;
                sendInputEl?.setSelectionRange(caretPosition, caretPosition);
            });
        }

        document.addEventListener("keydown", focusSendInputOnTyping);
        onCleanup(() => document.removeEventListener("keydown", focusSendInputOnTyping));
    })

    const updateAutoScroll = () => {
        if (!messagesEl) return;
        const distanceFromBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight;
        setAutoScrollMessages(distanceFromBottom <= AUTO_SCROLL_THRESHOLD);
    }

    const scrollToPresent = () => {
        requestAnimationFrame(() => {
            if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
        });
    }

    onMount(() => {
        if (!messagesEl) return;

        const resizeObserver = new ResizeObserver(() => {
            if (autoScrollMessages()) scrollToPresent();
        });

        resizeObserver.observe(messagesEl);
        onCleanup(() => resizeObserver.disconnect());
    })

    const returnToPresent = () => {
        setAutoScrollMessages(true);
        scrollToPresent();
    }

    createEffect(on(messages, () => {
        if (autoScrollMessages()) scrollToPresent();
    }))

    return (
        <ChatContainer>
            <header>
                <Title>chat</Title>
                <Divider />
            </header>
            <ChatBody>
                <Messages ref={messagesEl} onScroll={updateAutoScroll}>
                    <Show when={hasMoreMessages()}>
                        <LoadMoreButton onClick={loadMore}>[ LOAD MORE ]</LoadMoreButton>
                    </Show>
                    <For each={messages()}>
                        {msg => (
                            <Message
                                {...msg}
                                isOwn={msg.username === user()?.username}
                            />
                        )}
                    </For>
                </Messages>
                <Aside
                    whoIsOnline={whoisOnline()}
                    showReturnToPresent={!autoScrollMessages()}
                    onReturnToPresent={returnToPresent}
                />
            </ChatBody>
            <Divider color={'gray'}/>
            <SendForm onsubmit={send}>
                <SendInput
                    ref={sendInputEl}
                    value={content()}
                    onInput={e => setContent(e.target.value)}
                    placeholder="Message"
                    tabindex="1"
                />
                <SendButton type="submit" tabindex="2">SEND</SendButton>
            </SendForm>
            <Footer>
                Type messages and press [SEND] or RETURN to transmit. <br />
                <span>You are {user()?.username}. Be kind.</span>
            </Footer>
        </ChatContainer>
    )
}

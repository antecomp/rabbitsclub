import { createEffect, createSignal, For, on, onCleanup, onMount, Show } from "solid-js"
import { MESSAGE_PAGE_SIZE } from "../../../../config";
import { api } from "../api/backend"
import { user } from "../api/user"
import { MessageHistoryData } from "../types/message.type";
import Message from "../components/chat/Message";
import Footer from "../components/Footer";
import { Divider, Title } from "../styled/shared.styles";
import { playSoundOnce } from "../util/playSound";
import ping from '../assets/sfx/ping.mp3';
import enter from '../assets/sfx/enter.mp3'
import leave from '../assets/sfx/leave.mp3'
import Aside from "../components/chat/Aside";
import { ChatBody, ChatContainer, LoadMoreButton, Messages, SendButton, SendForm, SendInput } from "./Chat.styles";

const AUTO_SCROLL_THRESHOLD = 300;

export default function Chat() {
    const [content, setContent] = createSignal("");
    const [whoisOnline, setWhoIsOnline] = createSignal<string[]>([]);
    let messagesEl: HTMLDivElement | undefined;
    let sendInputEl: HTMLInputElement | undefined;

    const [messages, setMessages] = createSignal<MessageHistoryData>([]);
    const [hasMoreMessages, setHasMoreMessages] = createSignal(true);
    const [autoScrollMessages, setAutoScrollMessages] = createSignal(true);
    onMount(async () => {
        const { data } = await api.messages.get({ query: { limit: String(MESSAGE_PAGE_SIZE) } });
        if (data) {
            setMessages(data);
            setHasMoreMessages(data.length === MESSAGE_PAGE_SIZE);
        }
    });

    const loadMore = async () => {
        const oldest = messages()![0];
        if (!oldest) return;

        setAutoScrollMessages(false);
        const previousScrollHeight = messagesEl?.scrollHeight ?? 0;
        const previousScrollTop = messagesEl?.scrollTop ?? 0;

        const { data } = await api.messages.get({
            query: { before: String(oldest.id), limit: String(MESSAGE_PAGE_SIZE) }
        });
        if (!data) return;
        setMessages(prev => [...data, ...prev])
        setHasMoreMessages(data.length === MESSAGE_PAGE_SIZE)

        queueMicrotask(() => {
            if (!messagesEl) return;
            messagesEl.scrollTop = messagesEl.scrollHeight - previousScrollHeight + previousScrollTop;
        });
    }

    let sub: ReturnType<typeof api.ws.subscribe>

    onMount(() => {
        sub = api.ws.subscribe()

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
                    console.log(data);
                    switch(data.event) {
                        case 'user_joined':
                            playSoundOnce(enter);
                            break;
                        case 'user_left':
                            playSoundOnce(leave);
                            break;
                    }
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
        sub.send({ content: content() })
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

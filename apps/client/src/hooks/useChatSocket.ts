import { MAX_MESSAGE_LENGTH, MESSAGE_PAGE_SIZE } from "#config";
import { api } from "@/api/backend";
import { ChatMessage, UserChatMessage } from "@/types/message.type";
import { playSoundOnce } from "@/util/playSound";
import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";

import ping from '@/assets/sfx/ping.mp3';
import enter from '@/assets/sfx/enter.mp3'
import leave from '@/assets/sfx/leave.mp3'
import { notifyAuthFailure } from "@/api/auth";
import { createAuthAwareChatSocket } from "@/api/chatSocket";
import { user } from "@/api/user";

const AUTO_SCROLL_THRESHOLD = 300;

export default function useChatSocket(config: {
    messagesEl: () => HTMLDivElement | undefined;
    sendInputEl: () => HTMLInputElement | undefined;
}) {
    const [inputText, setInputText] = createSignal("");
    const [messages, setMessages] = createSignal<ChatMessage[]>([]);
    const [whoisOnline, setWhoIsOnline] = createSignal<string[]>([]);
    const [hasMoreMessages, setHasMoreMessages] = createSignal(true);
    const [autoScrollMessages, setAutoScrollMessages] = createSignal(true);

    const upsertUserMessage = (message: UserChatMessage) => {
        let inserted = false;

        setMessages(prev => {
            const existingIndex = prev.findIndex(
                msg => msg.type === "user" && msg.id === message.id
            );

            if (existingIndex === -1) {
                inserted = true;
                return [...prev, message];
            }

            const next = [...prev];
            next[existingIndex] = message;
            return next;
        });

        // to indicate if we upserted or not.
        return inserted;
    }

    onMount(async () => {
        const { data } = await api.messages.get({ query: { limit: String(MESSAGE_PAGE_SIZE) } });
        if (data) {
            const historyIds = new Set(data.map(msg => msg.id));
            setMessages(prev => [
                ...data,
                ...prev.filter(msg => msg.type === "system" || !historyIds.has(msg.id))
            ]);
            setHasMoreMessages(data.length === MESSAGE_PAGE_SIZE);
        }
    });

    const loadMore = async () => {
        const oldest = messages().find(msg => msg.type === "user");
        if (!oldest) return;

        setAutoScrollMessages(false);
        const messagesEl = config.messagesEl();
        const previousScrollHeight = messagesEl?.scrollHeight ?? 0;
        const previousScrollTop = messagesEl?.scrollTop ?? 0;

        const { data } = await api.messages.get({
            query: { before: String(oldest.id), limit: String(MESSAGE_PAGE_SIZE) }
        });
        if (!data) return;
        setMessages(prev => [...data, ...prev])
        setHasMoreMessages(data.length === MESSAGE_PAGE_SIZE)

        queueMicrotask(() => {
            const messagesEl = config.messagesEl();
            if (!messagesEl) return;
            messagesEl.scrollTop = messagesEl.scrollHeight - previousScrollHeight + previousScrollTop;
        });
    }

    const chatSocket = createAuthAwareChatSocket({
        isAuthenticated: () => Boolean(user()),
        onAuthFailure: (reason) => {
            notifyAuthFailure(reason)
        },
        onMessage: ({ data }) => {
            switch (data.type) {
                case 'user':
                    if (upsertUserMessage(data) && (!document.hasFocus() || !autoScrollMessages())) {
                        void playSoundOnce(ping);
                    }
                    break;
                case 'system':
                    setMessages(prev => [...prev, data]);
                    switch (data.event) {
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
        }
    });


    const isEditableElement = (target: EventTarget | null) => {
        return target instanceof HTMLElement
            && !!target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
    }

    onMount(() => {
        const focusSendInputOnTyping = (e: KeyboardEvent) => {
            const sendInputEl = config.sendInputEl();

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
            const start = sendInputEl.selectionStart ?? inputText().length;
            const end = sendInputEl.selectionEnd ?? start;
            const nextContent = `${inputText().slice(0, start)}${e.key}${inputText().slice(end)}`;
            setInputText(nextContent);

            queueMicrotask(() => {
                const caretPosition = start + e.key.length;
                config.sendInputEl()?.setSelectionRange(caretPosition, caretPosition);
            });
        }

        document.addEventListener("keydown", focusSendInputOnTyping);
        onCleanup(() => document.removeEventListener("keydown", focusSendInputOnTyping));
    })

    const updateAutoScroll = () => {
        const messagesEl = config.messagesEl();
        if (!messagesEl) return;
        const distanceFromBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight;
        setAutoScrollMessages(distanceFromBottom <= AUTO_SCROLL_THRESHOLD);
    }

    const scrollToPresent = () => {
        requestAnimationFrame(() => {
            const messagesEl = config.messagesEl();
            if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
        });
    }

    onMount(() => {
        const messagesEl = config.messagesEl();
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
    }));

    const send = (e: SubmitEvent) => {
        e.preventDefault()
        if (!inputText() || !user()) return;
        if (inputText().length > MAX_MESSAGE_LENGTH) return;
        chatSocket.send({ content: inputText() })
        setInputText("")
    }

    return {
        whoisOnline,
        hasMoreMessages,
        loadMore,
        updateAutoScroll,
        returnToPresent,
        messages,
        autoScrollMessages,
        inputText,
        setInputText,
        send
    }
}

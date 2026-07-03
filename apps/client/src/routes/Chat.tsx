import { For, Show } from "solid-js"
import { MAX_MESSAGE_LENGTH } from "#config";
import { user } from "../api/user"
import Message from "../components/chat/Message";
import SystemMessage from "../components/chat/SystemMessage";
import Footer from "../components/Footer";
import { Divider, Title } from "../styled/shared.styles";
import Aside from "../components/chat/Aside";
import { ChatBody, ChatContainer, FormTooltip, LoadMoreButton, Messages, SendButton, SendForm, SendInput } from "./Chat.styles";
import useChatSocket from "@/hooks/useChatSocket";

export default function Chat() {
    let messagesEl: HTMLDivElement | undefined;
    let sendInputEl: HTMLInputElement | undefined;

    const {
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
    } = useChatSocket({
        messagesEl: () => messagesEl,
        sendInputEl: () => sendInputEl
    })

    const formTooltip = () => {
        if (inputText().length >= MAX_MESSAGE_LENGTH * 0.80) {
            return `( ${inputText().length} / ${MAX_MESSAGE_LENGTH} )`
        }
    }

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
                            msg.type === "system"
                                ? <SystemMessage message={msg} />
                                : (
                                    <Message
                                        {...msg}
                                        isOwn={msg.username === user()?.username}
                                    />
                                )
                        )}
                    </For>
                </Messages>
                <Aside
                    whoIsOnline={whoisOnline()}
                    showReturnToPresent={!autoScrollMessages()}
                    onReturnToPresent={returnToPresent}
                />
            </ChatBody>
            <Divider color={'gray'} />
            <SendForm onsubmit={send}>
                <SendInput
                    ref={sendInputEl}
                    value={inputText()}
                    onInput={e => setInputText(e.target.value)}
                    placeholder="Message"
                    tabindex="1"
                    maxlength={MAX_MESSAGE_LENGTH}
                />
                <SendButton type="submit" tabindex="2">SEND</SendButton>
                <FormTooltip>{formTooltip()}</FormTooltip>
            </SendForm>
            <Footer>
                Type messages and press [SEND] or RETURN to transmit. <br />
                <span>You are {user()?.username}. Be kind.</span>
            </Footer>
        </ChatContainer>
    )
}

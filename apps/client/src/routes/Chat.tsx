import { createEffect, createResource, createSignal, For, onCleanup, onMount, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { BE } from "../api"
import { refetchUser, user } from "../store"
import { MessageHistoryData } from "../types/message.type";
import Message from "../components/chat/Message";
import Footer from "../components/Footer";
import { styled } from "solid-styled-components";
import { Divider, Title } from "../styled/MainMenu";

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
    
    button {
        border: none;
        background: none;
    }

    button:hover, button:focus {
        color: gray;
        outline: none;
        cursor: pointer;
    }
`

// temp, will do better layout later.
const Messages = styled('div')`
    overflow: auto;
`

export default function Chat() {
    const navigate = useNavigate();
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

        sub.on("message", ({ data }) => {
            switch (data.type) {
                case 'user':
                    setMessages(prev => [...prev, data])
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

    const logout = async () => {
        await BE.auth.logout.post()
        await refetchUser();
        navigate("/", { replace: true })
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
                <Divider/>
            </header>
            <Messages ref={messagesEl}>
                <Show when={hasMoreMessages()}>
                    <button style={'width: 100%;'} onClick={loadMore}>[ LOAD MORE ]</button>
                </Show>
                <For each={messages()}>
                    {msg => Message(msg)}
                </For>
            </Messages>
            <form onsubmit={send}>
                <input
                    value={content()}
                    onInput={e => setContent(e.target.value)}
                    placeholder="Message"
                />
                <button type="submit">[ SEND ]</button>
            </form>
            <Footer>
                <span>Logged in as {user()?.username}</span>
                <button onClick={logout}>[ LOG OUT ]</button>
                <br />
                online: {whoisOnline().join(", ")}
            </Footer>
        </ChatContainer>
    )
}

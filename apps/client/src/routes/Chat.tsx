import { createResource, createSignal, For, onCleanup, onMount, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { BE } from "../api"
import { refetchUser, user } from "../store"
import { MessageHistoryData } from "../types/message.type";

export default function Chat() {
    const navigate = useNavigate();
    const [content, setContent] = createSignal("");
    const [whoisOnline, setWhoIsOnline] = createSignal<string[]>([]);

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
        navigate("/", {replace: true})
    }

    return (
        <div>
            <header>
                <span>Logged in as {user()?.username}</span>
                <button onClick={logout}>Logout</button>
                <br />
                online: {whoisOnline().join(", ")}
            </header>
            <Show when={hasMoreMessages()}>
                <button onClick={loadMore}>Load More</button>
            </Show>
            <For each={messages()}>
                {msg => (
                    <div>
                        <strong>{msg.username}</strong>: {msg.content}
                    </div>
                )}
            </For>
            <form onsubmit={send}>
                <input
                    value={content()}
                    onInput={e => setContent(e.target.value)}
                    placeholder="Message"
                />
                <button type="submit">Send</button>
            </form>
        </div>
    )
}
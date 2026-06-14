import { createResource, createSignal, For, onCleanup, onMount } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { BE } from "../api"
import { refetchUser, user } from "../store"

export default function Chat() {
    const navigate = useNavigate();
    const [content, setContent] = createSignal("");
    const [whoisOnline, setWhoIsOnline] = createSignal<string[]>([]);

    const [messages, { mutate }] = createResource(async () => {
        const { data } = await BE.messages.get()
        return data ?? []
    })

    let sub: ReturnType<typeof BE.ws.subscribe>

    onMount(() => {
        sub = BE.ws.subscribe()

        sub.on("message", ({ data }) => {
            switch (data.type) {
                case 'user':
                    mutate(prev => [...(prev ?? []), data]);
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
        navigate("/login")
    }

    return (
        <div>
            <header>
                <span>Logged in as {user()?.username}</span>
                <button onClick={logout}>Logout</button>
                <br />
                online: {whoisOnline().join(", ")}
            </header>
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
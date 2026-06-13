import { createResource, createSignal, For, Index, onCleanup, onMount } from "solid-js"
import { BE } from "./api"
import type { Treaty } from "@elysiajs/eden";

function App() {
  const [health] = createResource(async () => {
    const { data } = await BE.health.get()
    return data
  });

  const [messages, { mutate }] = createResource(async () => {
    const { data } = await BE.messages.get();
    return data;
  });

  // Good enough for now
  const [username, setUsername] = createSignal("");
  const [content, setContent] = createSignal("");

  const sub = BE.ws.subscribe();

  onMount(() => {

    sub.on("message", ({ data }) => {
      mutate(prev => [...(prev ?? []), data]);
    });

    onCleanup(() => sub.close());
  });

  const send = (e: SubmitEvent | MouseEvent | undefined) => {
    e?.preventDefault();
    if (!username() || !content()) return;
    sub.send({ username: username(), content: content() });
    setContent("");
  }

  return (
    <main>
      <section>{health()?.status}</section>
      <For each={messages()}>
        {msg => (
          <div>
            <strong>{msg.username}</strong>: {msg.content}
          </div>
        )}
      </For>
      <form onsubmit={send}>
        <input value={username()} onInput={e => setUsername(e.target.value)} placeholder="Username" />
        <input value={content()} onInput={e => setContent(e.target.value)} placeholder="Message" />
        <button onClick={send}>Send</button>
      </form>
    </main>
  )
}

export default App

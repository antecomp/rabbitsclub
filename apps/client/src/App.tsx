import { createResource, Index } from "solid-js"
import { BE } from "./api"

function App() {
  const [health] = createResource(async () => {
    const { data } = await BE.health.get()
    return data
  });

  const [recentMessages] = createResource(async () => {
    const {data} = await BE.messages.get();
    return data;
  });

  return (
    <main>
      <h1>Chat App</h1>
      <p>Backend status: {health()?.status}</p>
      <hr />
      <Index each={recentMessages()}>
        {(message) => <p>{message().username}: {message().content}</p>}
      </Index>
    </main>
  )
}

export default App

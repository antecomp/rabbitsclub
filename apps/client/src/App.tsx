import { createResource } from "solid-js"
import { BE } from "./api"

function App() {
  const [health] = createResource(async () => {
    const { data } = await BE.api.health.get()
    return data
  })

  return (
    <main>
      <h1>Chat App</h1>
      <p>Backend status: {health()?.status}</p>
    </main>
  )
}

export default App

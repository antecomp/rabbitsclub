import { createSignal, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { BE } from "../api"
import { refetchUser } from "../store"

export default function Login() {
    const navigate = useNavigate()
    const [username, setUsername] = createSignal("")
    const [password, setPassword] = createSignal("")
    const [registerCode, setRegisterCode] = createSignal("");
    const [error, setError] = createSignal("")
    const [isRegister, setIsRegister] = createSignal(false)

    const submit = async (e: SubmitEvent) => {
        e.preventDefault()
        setError("")

        const endpoint = isRegister() ? BE.auth.register : BE.auth.login
        const { error: err } = await endpoint.post({
            username: username(),
            password: password(),
            code: registerCode()
        })

        if (err) {
            setError(err.value.message ?? "unknown error")
            return
        }

        await refetchUser()
        navigate("/chat")
    }

    return (
        <div>
            <h1>{isRegister() ? "Register" : "Login"}</h1>
            {error() && <p>{error()}</p>}
            <form onsubmit={submit}>
                <input
                    value={username()}
                    onInput={e => setUsername(e.target.value)}
                    placeholder="Username"
                />
                <input
                    type="password"
                    value={password()}
                    onInput={e => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <Show when={isRegister()}>
                    <input
                        value={registerCode()}
                        onInput={e => setRegisterCode(e.target.value)}
                        placeholder="Registration Code"
                    />
                </Show>
                <button type="submit">
                    {isRegister() ? "Register" : "Login"}
                </button>
            </form>
            <button onClick={() => setIsRegister(r => !r)}>
                {isRegister() ? "Already have an account? Login" : "Need an account? Register"}
            </button>
        </div>
    )
}
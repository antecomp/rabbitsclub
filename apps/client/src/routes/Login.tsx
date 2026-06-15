import { createSignal, Match, Show, Switch } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { BE } from "../api"
import { refetchUser } from "../store"
import { styled } from "solid-styled-components"

const Container = styled("div")`
    position: absolute;
    top: 40%;
    left: 10vw;
    transform: translate(0%, -50%);
`;

const Selector = styled("div")`
    display: flex;
    > h1:hover {
        cursor: pointer;
        color: gray;
    }
`

const Title = styled("h1")`
    font-size: 4rem;
`;

const Subtitle = styled("h2")`
    font-size: 2rem;
`;

const Divider = styled("hr")`
    border-color: black;
    border-style: solid;
    border-width: 1px;
`

export default function Login() {
    const navigate = useNavigate()
    const [username, setUsername] = createSignal("")
    const [password, setPassword] = createSignal("")
    const [registerCode, setRegisterCode] = createSignal("");
    const [error, setError] = createSignal("")

    const [mode, setMode] = createSignal<"landing" | "login" | "register">("landing");
    const isRegister = () => mode() == 'register';

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
        <Container>
            <Switch>
                <Match when={mode() == 'landing'}>
                    <Selector>
                        <Title onClick={() => setMode('login')}>login</Title>
                    </Selector>
                    <Selector>
                        <Title onClick={() => setMode('register')}>register</Title>
                    </Selector>
                </Match>
                <Match when={mode() === 'login'}>
                    <Title>login</Title>
                    <Subtitle>enter credentials</Subtitle>
                </Match>
                <Match when={mode() === 'register'}>
                    <Title>register</Title>
                    <Subtitle>create account</Subtitle>
                </Match>
            </Switch>
            <Show when={mode() !== 'landing'}>
                <Divider />
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
            </Show>
        </Container>
    )
}
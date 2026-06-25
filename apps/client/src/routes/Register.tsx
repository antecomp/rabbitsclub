import { createSignal, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { api } from "../api/backend"
import { refetchUser } from "../api/user"
import { AuthForm } from "../styled/shared.styles"

type RegisterProps = {
    inviteCode?: string
}

export default function Register(props: RegisterProps) {
    const navigate = useNavigate()
    const [username, setUsername] = createSignal("")
    const [password, setPassword] = createSignal("")
    const [error, setError] = createSignal("");

    const submit = async (e: SubmitEvent) => {
        e.preventDefault()
        setError("")

        if (!props.inviteCode) {
            setError("You need a valid invitation link to join.")
            return
        }

        const { error: err } = await api.auth.register.post({
            username: username(),
            password: password(),
            code: props.inviteCode
        })

        if (err) {
            setError(err.value.message ?? "unknown error")
            return
        }

        await refetchUser()
    }

    const hasInvite = () => Boolean(props.inviteCode)

    return (
        <>
            <Show
                when={hasInvite()}
                fallback={
                    <AuthForm as="div">
                        <button type="button" onClick={() => navigate("/")}>[ BACK ]</button>
                    </AuthForm>
                }
            >
                <AuthForm onsubmit={submit}>
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
                    <button type="submit">[ REGISTER ]</button>
                    <button type="button" onClick={() => navigate("/")}>[ BACK ]</button>
                </AuthForm>
            </Show>
            {error()}
        </>
    )
}

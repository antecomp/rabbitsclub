import { createSignal, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { api } from "../api/backend"
import { refetchUser } from "../api/user"
import { AuthForm } from "../styled/shared.styles"
import { AvatarData } from "@/avatar/avatar.types"
import {
    MAX_PASSWORD_LENGTH,
    MAX_USERNAME_LENGTH,
    MIN_PASSWORD_LENGTH,
    MIN_USERNAME_LENGTH
} from "#config"

type RegisterProps = {
    inviteCode?: string
    avatar?: AvatarData
}

export default function Register(props: RegisterProps) {
    const navigate = useNavigate()
    const [username, setUsername] = createSignal("")
    const [password, setPassword] = createSignal("")
    const [error, setError] = createSignal("");

    const validateCredentials = () => {
        if (username().length < MIN_USERNAME_LENGTH) {
            return `Username must be at least ${MIN_USERNAME_LENGTH} characters.`
        }

        if (username().length > MAX_USERNAME_LENGTH) {
            return `Username must be at most ${MAX_USERNAME_LENGTH} characters.`
        }

        if (password().length < MIN_PASSWORD_LENGTH) {
            return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
        }

        if (password().length > MAX_PASSWORD_LENGTH) {
            return `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`
        }

        return ""
    }

    const submit = async (e: SubmitEvent) => {
        e.preventDefault()
        setError("")

        if (!props.inviteCode) {
            setError("You need a valid invitation link to join.")
            return
        }

        const validationError = validateCredentials()
        if (validationError) {
            setError(validationError)
            return
        }

        const { error: err } = await api.auth.register.post({
            username: username(),
            password: password(),
            avatar: props.avatar,
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
                        minlength={MIN_USERNAME_LENGTH}
                        maxlength={MAX_USERNAME_LENGTH}
                        required
                    />
                    <input
                        type="password"
                        value={password()}
                        onInput={e => setPassword(e.target.value)}
                        placeholder="Password"
                        minlength={MIN_PASSWORD_LENGTH}
                        maxlength={MAX_PASSWORD_LENGTH}
                        required
                    />
                    <button type="submit">[ REGISTER ]</button>
                    <button type="button" onClick={() => navigate("/")}>[ BACK ]</button>
                    <Show when={error()}>
                        <hr/>
                        {error()}
                    </Show>
                </AuthForm>
            </Show>
        </>
    )
}

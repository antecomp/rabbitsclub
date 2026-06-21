import { createSignal } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { api } from "../api/backend"
import { refetchUser } from "../api/user"
import Footer from "../components/Footer"
import { Container, Title, Subtitle, Divider, AuthForm } from "../styled/shared.styles"

export default function Register() {
    const navigate = useNavigate()
    const [username, setUsername] = createSignal("")
    const [password, setPassword] = createSignal("")
    const [registerCode, setRegisterCode] = createSignal("")
    const [error, setError] = createSignal("")

    const submit = async (e: SubmitEvent) => {
        e.preventDefault()
        setError("")

        const { error: err } = await api.auth.register.post({
            username: username(),
            password: password(),
            code: registerCode()
        })

        if (err) {
            setError(err.value.message ?? "unknown error")
            return
        }

        await refetchUser()
    }

    return (
        <Container>
            <Title>register</Title>
            <Subtitle>create account</Subtitle>
            <Divider />
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
                <input
                    value={registerCode()}
                    onInput={e => setRegisterCode(e.target.value)}
                    placeholder="Registration Code"
                />
                <button type="submit">[ REGISTER ]</button>
                <button onClick={() => navigate("/")}>[ BACK ]</button>
            </AuthForm>
            <Footer>
                You must have a valid registration code to join. <br /> {error()}
            </Footer>
        </Container>
    )
}

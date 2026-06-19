import { createSignal } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { BE } from "../api"
import { refetchUser } from "../store"
import Footer from "../components/Footer"
import { Container, Title, Subtitle, Divider, AuthForm } from "../styled/MainMenu"

export default function Login() {
    const navigate = useNavigate()
    const [username, setUsername] = createSignal("")
    const [password, setPassword] = createSignal("")
    const [error, setError] = createSignal("")

    const submit = async (e: SubmitEvent) => {
        e.preventDefault()
        setError("")

        const { error: err } = await BE.auth.login.post({
            username: username(),
            password: password(),
        })

        if (err) {
            setError(err.value.message ?? "unknown error")
            return
        }

        await refetchUser()
        navigate("/")
    }

    return (
        <Container>
            <Title>login</Title>
            <Subtitle>authentication menu</Subtitle>
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
                <button type="submit">[ LOGIN ]</button>
                <button onClick={() => navigate("/")}>[ BACK ]</button>
            </AuthForm>
            <Footer>
                Enter credentials into input fields. <br /> {error()}
            </Footer>
        </Container>
    )
}

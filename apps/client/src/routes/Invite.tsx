import { createResource, Show } from "solid-js"
import { useNavigate, useParams } from "@solidjs/router"
import { api } from "../api/backend"
import Footer from "../components/Footer"
import { AuthForm, Container, Divider, Subtitle, Title } from "../styled/shared.styles"
import Register from "./Register"
import { styled } from "solid-styled-components"

const InviteMessage = styled('p')`
    font-size: 18px;
    padding: 10px;
`

export default function Invite() {
    const params = useParams()
    const navigate = useNavigate()

    const [invite] = createResource(
        () => params.code,
        async (code) => {
            const { data } = await api.auth.invite({ code }).get()
            return data
        }
    )

    return (
        <Show
            when={!invite.loading}
            fallback={
                <Container>
                    <Title>Welcome</Title>
                    <Subtitle>New User Creation</Subtitle>
                    <Divider />
                    <InviteMessage>Loading invitation...</InviteMessage>
                    <Footer/>
                </Container>
            }
        >
            <Show
                when={invite()}
                fallback={
                    <Container>
                        <Title>error</Title>
                        <Divider />
                        <InviteMessage>
                            Invite invalid or already claimed.
                        </InviteMessage>
                        <AuthForm as="div">
                            <button type="button" onClick={() => navigate("/")}>[ BACK ]</button>
                        </AuthForm>
                        <Footer/>
                    </Container>
                }
            >
                {(inviteData) => (
                    <Container>
                        <Title>Welcome</Title>
                        <Subtitle>New User Creation</Subtitle>
                        <Divider />
                        <InviteMessage>
                            {inviteData().invited_by_username} has invited you to join rabbits.club!
                        </InviteMessage>
                        <Register
                            inviteCode={inviteData().code}
                        />
                        <Footer>Fill out input fields to register a new account.</Footer>
                    </Container>
                )}
            </Show>
        </Show>
    )
}

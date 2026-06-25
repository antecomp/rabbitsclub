import { createResource, Show } from "solid-js"
import { useNavigate, useParams } from "@solidjs/router"
import { api } from "../api/backend"
import Footer from "../components/Footer"
import { AuthForm, Container, Divider, Subtitle, Title } from "../styled/shared.styles"
import Register from "./Register"
import { styled } from "solid-styled-components"
import { AvatarCanvas } from "@/avatar/AvatarCanvas"
import { DEFAULT_AVATAR } from "@/avatar/avatar.const"

import cbr from '../assets/ui/c_br.png?url&no-inline';
import { clampedHeadVariant, eyeVariants, heads } from "@/avatar/avatar.assets"
import pickRandom from "@/util/pickRandom"
import { createStore } from "solid-js/store"
import { AvatarData } from "@/avatar/avatar.types"

const InviteMessage = styled('p')`
    font-size: 18px;
    padding: 10px;
`

const RegisterGrid = styled('div')`
    display: grid;
    grid-template-columns: 1fr 2fr;


    canvas {
        width: 100%;
        background: url(${cbr});
        --bevel: 15px;
        clip-path: polygon(
            var(--bevel) 0,
            calc(100% - var(--bevel)) 0,
            100% var(--bevel),
            100% calc(100% - var(--bevel)),
            calc(100% - var(--bevel)) 100%,
            var(--bevel) 100%,
            0 calc(100% - var(--bevel)),
            0 var(--bevel)
        );
    }

    div:first-child {
        position: relative;
        text-align: center;
        button {
            font-size: 16px;
        }

        h3 {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 2;
            background-color: #ffffff;
            padding: 2px;

        clip-path: polygon(100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 0);
        }
    }
`

function createRandomAvatar(): AvatarData {
    return {
        ...DEFAULT_AVATAR,
        head: clampedHeadVariant(Math.floor(Math.random() * heads.length)),
        leftEye: pickRandom(eyeVariants),
        rightEye: pickRandom(eyeVariants),
    }
}

export default function Invite() {
    const params = useParams()
    const navigate = useNavigate()

    const [invite] = createResource(
        () => params.code,
        async (code) => {
            const { data } = await api.auth.invite({ code }).get()
            return data
        }
    );

    const [avatar, setAvatar] = createStore<AvatarData>(createRandomAvatar());

    return (
        <Show
            when={!invite.loading}
            fallback={
                <Container>
                    <Title>Welcome</Title>
                    <Subtitle>New User Creation</Subtitle>
                    <Divider />
                    <InviteMessage>Loading invitation...</InviteMessage>
                    <Footer />
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
                        <Footer />
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
                        <RegisterGrid>
                            <div>
                                <h3>your avatar</h3>
                                <AvatarCanvas state={avatar} />
                                <button onClick={() => setAvatar(createRandomAvatar())}>[ RANDOMIZE ]</button>
                            </div>
                            <Register
                                inviteCode={inviteData().code}
                                avatar={avatar}
                            />
                        </RegisterGrid>
                        <Footer>Fill out input fields to register a new account.</Footer>
                    </Container>
                )}
            </Show>
        </Show>
    )
}

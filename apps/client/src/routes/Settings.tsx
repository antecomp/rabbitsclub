import { createSignal } from "solid-js"
import { BE } from "../api";
import { AuthForm, Container, Divider, Selector, Subtitle, Title } from "../styled/MainMenu";
import Footer from "../components/Footer";
import { useNavigate } from "@solidjs/router";
import { refetchUser } from "../store";

export default function Settings() {
    const navigate = useNavigate();

    const logout = async () => {
        await BE.auth.logout.post()
        await refetchUser();
        navigate("/", { replace: true });
    }
    //  When Iget more actions just make submenus like [ USERS ] [ INVITES ]...
    return <Container>
        <Title>Settings</Title>
        <Subtitle>User setting dashboard</Subtitle>
        <Divider />
        <AuthForm>
            [ MORE WILL GO HERE LATER ]
            <button onClick={logout}>[ LOGOUT ]</button>
            <button onClick={() => navigate("/")}>[ BACK ]</button>
        </AuthForm>
        <Footer>Use input device to select user option.</Footer>
    </Container>
}
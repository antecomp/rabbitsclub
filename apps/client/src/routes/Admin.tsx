import { createSignal } from "solid-js"
import { BE } from "../api";
import { AuthForm, Container, Divider, Subtitle, Title } from "../styled/MainMenu";
import Footer from "../components/Footer";
import { useNavigate } from "@solidjs/router";

export default function Admin() {
    const navigate = useNavigate();
    const [inviteCode, setInviteCode] = createSignal("");
    const sendInvite = (e: SubmitEvent) => {
        e.preventDefault();
        if(!inviteCode()) return;
        BE.admin.invite.post({code: inviteCode()});
        setInviteCode("");
    }
    //  When Iget more actions just make submenus like [ USERS ] [ INVITES ]...
    return <Container>
        <Title>Admin</Title>
        <Subtitle>System setting dashboard</Subtitle>
        <Divider/>
        <AuthForm onsubmit={sendInvite}>
            <input 
                value={inviteCode()}
                onInput={e => setInviteCode(e.target.value)}
                placeholder="Invite Code"
            />
            <button type="submit">[ SEND INVITE ]</button>
            <button onClick={() => navigate("/")}>[ BACK ]</button>
        </AuthForm>
        <Footer>I trust you know what you're doing...</Footer>
        </Container>
}
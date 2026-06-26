import { api } from "../api/backend";
import { AuthForm, Container, Divider, Subtitle, Title } from "../styled/shared.styles";
import Footer from "../components/Footer";
import { useNavigate } from "@solidjs/router";
import { refetchUser } from "../api/user";
import { usePreferences } from "../context/Preferences";
import { styled } from "solid-styled-components";

const ToggleCon = styled('div')`
    display: flex;
    width: 70%;
    align-items: center;

    span {
      flex-grow: 1;
      height: 1px;
      border-top: dashed gray 2px;
      margin: 0 10px;
    }
`

export default function Settings() {
    const navigate = useNavigate();

    const logout = async () => {
        await api.auth.logout.post()
        await refetchUser();
        navigate("/", { replace: true });
    }

    const logoutAll = async () => {
        await api.auth["logout-all"].post();
        await refetchUser();
        navigate("/", { replace: true })
    }

    const { preferences, setPreferences } = usePreferences();

    return <Container>
        <Title>Settings</Title>
        <Subtitle>configure experience</Subtitle>
        <Divider />
        <AuthForm>
            <ToggleCon>
                <p>CHAT LAYOUT</p><span />
                <button type="button" onClick={() => setPreferences('incomingOnRight', prev => !prev)}>
                    {preferences.incomingOnRight ? '[ LEFT ]' : '[ RIGHT ]'}
                </button>
            </ToggleCon>
            <button type="button" onClick={logout}>[ LOGOUT ]</button>
            <button type="button" onClick={logoutAll}>[ LOGOUT EVERYWHERE ]</button>
            <button type="button" onClick={() => navigate("/")}>[ BACK ]</button>
        </AuthForm>
        <Footer>Use input device to select user option.</Footer>
    </Container>
}

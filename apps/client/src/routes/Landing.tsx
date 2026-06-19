import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { Container, Selector } from "../styled/MainMenu";
import Footer from "../components/Footer";
import { refetchUser, user } from "../store";
import { BE } from "../api";

export default function Landing() {
    const navigate = useNavigate();

    const logout = async () => {
        await BE.auth.logout.post()
        await refetchUser();
        navigate("/", { replace: true });
    }
    return <>
        <Container>
            <Show
                when={user()}
                fallback={<>
                    <Selector onClick={() => navigate("/login")}>login</Selector>
                    <Selector onClick={() => navigate("/register")}>register</Selector>
                </>}
            >
                <Selector onClick={() => navigate("/chat")}>resume</Selector>
                {/* replace this with "settings" later? */}
                <Selector onClick={logout}>logout</Selector>
            </Show>
            <Show when={user()?.is_admin}>
                <Selector onClick={() => navigate("/admin")}>admin</Selector>
            </Show>
            <Selector onClick={() => navigate("/about")}>about</Selector>
            <Footer>
                Use input device to select menu options.
            </Footer>
        </Container>
    </>
}

import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { Container, Selector } from "../styled/MainMenu";
import Footer from "../components/Footer";
import { user } from "../api/user";

export default function Landing() {

    const navigate = useNavigate();
    return <>
        <Container>
            <Show
                when={user()}
                fallback={<>
                    <Selector onClick={() => navigate("/login")}>login</Selector>
                    <Selector onClick={() => navigate("/register")}>register</Selector>
                </>}
            >
                <Selector onClick={() => navigate("/chat")}>chat</Selector>
                <Selector onClick={() => navigate("/settings")}>settings</Selector>
                <Selector onClick={() => navigate("/avatar")}>avatar</Selector>
            </Show>
            <Show when={user()?.is_admin}>
                <Selector onClick={() => navigate("/admin")}>admin</Selector>
            </Show>
            <Show when={!user()}>
                <Selector onClick={() => navigate("/about")}>about</Selector>
            </Show>
            <Footer>
                <Show when={user()}>
                    Hello, {user()?.username}. <br />
                </Show>
                Use input device to select menu options.
            </Footer>
        </Container>
    </>
}

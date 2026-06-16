import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { Container, Selector } from "../styled/MainMenu";
import Footer from "../components/Footer";
import { user } from "../store";

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
                <Selector onClick={() => navigate("/chat")}>resume</Selector>
            </Show>
            <Selector onClick={() => navigate("/about")}>about</Selector>
            <Footer>
                Use input device to select menu options.
            </Footer>
        </Container>
    </>
}

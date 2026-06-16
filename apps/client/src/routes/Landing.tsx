import { useNavigate } from "@solidjs/router";
import { Container, Selector } from "../styled/MainMenu";
import Footer from "../components/Footer";

export default function Landing() {
    const navigate = useNavigate();
    return <>
        <Container>
            <Selector onClick={() => navigate("/login")}>login</Selector>
            <Selector onClick={() => navigate("/register")}>register</Selector>
            <Selector onClick={() => navigate("/about")}>about</Selector>
            <Footer>
                Use input device to select menu options.
            </Footer>
        </Container>
    </>
}

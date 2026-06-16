import { useNavigate } from "@solidjs/router";
import { Container, Selector, Title } from "../styled/MainMenu";
import Footer from "../components/Footer";

export default function Landing() {
    const navigate = useNavigate();
    return <>
        <Container>
            <Selector>
                <Title onClick={() => navigate("/login")}>login</Title>
            </Selector>
            <Selector>
                <Title onClick={() => navigate("/register")}>register</Title>
            </Selector>
            <Footer/>
        </Container>
    </>
}

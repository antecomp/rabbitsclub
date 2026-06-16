import { styled } from "solid-styled-components";
import { Container, Divider, Subtitle, Title } from "../styled/MainMenu";
import { useNavigate } from "@solidjs/router";
import Footer from "../components/Footer";

const Details = styled("p")`
    padding: 10px;

    button {
        border: none;
        background: none;
        font-size: 18px;
    }

    button:hover, button:focus {
        color: gray;
        outline: none;
        cursor: pointer;
    }
`

export default function About() {
    const navigate = useNavigate();
    return (
        <Container>
            <Title>About</Title>
            <Subtitle>Website information</Subtitle>
            <Divider />
            <Details>
                rabbits.club is a invite-only social service for trve rabbits. <br />
                To join you must receive an invitation from an administrator. There is no use in trying to request an invite,
                we choose our new members with care. <br />
                For inquiries you can reach us at: <a href="mailto:adm@omni.vi">adm@omni.vi</a> <br />
                <br />
                There are __ registers users. <br /> <br />
                <button onClick={() => navigate("/")}>[ BACK ]</button>
            </Details>
            <Footer/>
        </Container>
    )
}
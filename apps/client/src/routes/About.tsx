import { styled } from "solid-styled-components";
import { Container, Divider, Subtitle, Title } from "../styled/shared.styles";
import { useNavigate } from "@solidjs/router";
import Footer from "../components/Footer";
import { createResource } from "solid-js";
import { api } from "../api/backend";

const Details = styled("p")`
    padding: 10px;

    button {
        font-size: 18px;
    }
`

const [userCount] = createResource(async () => {
    return (await api.usercount.get()).data
})

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
                <br />
                There are {userCount() ?? '__'} registered users. <br /> <br />
                <button onClick={() => navigate("/")}>[ BACK ]</button>
            </Details>
            <Footer>
                For inquiries you can reach us at: <a href="mailto:adm@omni.vi">adm@omni.vi</a>
            </Footer>
        </Container>
    )
}
import Footer from "@/components/Footer";
import Link from "@/components/Link";
import { AuthForm, Container, Divider, Subtitle, Title } from "@/styled/shared.styles";
import { styled } from "solid-styled-components";
import sus from '../assets/misc/sus.png';


const Grid = styled('div')`
    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
    gap: 10px;
    min-height: 220px;
`

export default function Error404Page() {
    return (
        <Container>
            <Title>error 404</Title>
            <Subtitle>page not found</Subtitle>
            <Divider />
            <Grid>
                <div>
                    <img src={sus} height={220}></img>
                </div>
                <AuthForm as={'div'}>
                    The requested URL was not found on this server.
                    <Link href="/" replace>[ HOME ]</Link>
                </AuthForm>
            </Grid>
            <Footer />
        </Container>
    )
}
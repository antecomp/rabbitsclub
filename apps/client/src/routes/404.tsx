import Link from "@/components/Link";
import { AuthForm, Container, Divider, Subtitle, Title } from "@/styled/shared.styles";

export default function Error404Page() {
    return (
        <Container>
            <Title>error 404</Title>
            <Subtitle>page not found</Subtitle>
            <Divider/>
            <AuthForm as={'div'}>
                The requested URL was not found on this server.
                <Link href="/" replace>[ HOME ]</Link>
            </AuthForm>
        </Container>
    )
}
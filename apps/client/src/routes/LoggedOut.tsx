import { AuthForm, Container, Divider, Subtitle, Title } from "@/styled/shared.styles";
import { Navigate, useLocation, useNavigate } from "@solidjs/router";
import type { AuthErrorCode } from "~/schemas/auth.schema";

const AUTH_ERROR_DESCRIPTIONS: Readonly<Record<AuthErrorCode, string>> = {
    origin_not_allowed:
        'Invalid Origin (How did you manage this?)',
    session_expired:
        'Your session has expired.',
    session_revoked:
        'Your session was revoked.',
    unauthenticated:
        'You are missing credentials.'
}
export default function LoggedOut() {
    const location = useLocation<{ reason: AuthErrorCode }>();
    const navigate = useNavigate();
    const reason = location.state?.reason;

    if (!reason) return <Navigate href="/" />

    return (
        <Container>
            <Title>error</Title>
            <Subtitle>authentication failure</Subtitle>
            <Divider />
            <br />
            <AuthForm>
                You have been automatically logged out due to an authentication failure: 
                {reason && AUTH_ERROR_DESCRIPTIONS[reason]}
                <button type="button" onClick={() => navigate("/", { replace: true })}>[ HOME ]</button>
                <button type="button" onClick={() => navigate("/login", { replace: true })}>[ LOGIN ]</button>
            </AuthForm>
        </Container>
    )
}

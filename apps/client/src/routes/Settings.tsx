import { api } from '../api/backend';
import { AuthForm, Container, Divider, Subtitle, ThinDivider, Title } from '../styled/shared.styles';
import Footer from '../components/Footer';
import { useNavigate } from '@solidjs/router';
import { refetchUser } from '../api/user';
import Link from '@/components/Link';

export default function Settings() {
    const navigate = useNavigate();

    const logout = async () => {
        await api.auth.logout.post();
        await refetchUser();
        navigate('/', { replace: true });
    };

    const logoutAll = async () => {
        await api.auth['logout-all'].post();
        await refetchUser();
        navigate('/', { replace: true });
    };

    return <Container>
        <Title>Settings</Title>
        <Subtitle>configure experience</Subtitle>
        <Divider />
        <AuthForm>
            <button type="button" onClick={logout}>[ LOGOUT ]</button>
            <button type="button" onClick={logoutAll}>[ LOGOUT EVERYWHERE ]</button>
            <ThinDivider color="gray"/>
            <Link href="/">[ BACK ]</Link>
        </AuthForm>
        <Footer>Use input device to select user option.</Footer>
    </Container>;
}

import { api } from '../api/backend';
import { AuthForm, Container, Divider, Subtitle, ThinDivider, Title } from '../styled/shared.styles';
import Footer from '../components/Footer';
import { useNavigate } from '@solidjs/router';
import { refetchUser } from '../api/user';
import { usePreferences } from '../context/Preferences';
import { styled } from 'solid-styled-components';
import Link from '@/components/Link';
import createFlatToggle from '@/components/toggles/FlatToggle';
import { createEffect } from 'solid-js';

const ToggleCon = styled('div')`
    display: flex;
    width: 100%;
    align-items: center;
`;

const Gapper = styled('span')`
      flex-grow: 1;
      height: 1px;
      border-top: dashed gray 2px;
      margin: 0 10px;
`

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

    const { preferences, setPreferences } = usePreferences();
    const [chatLayoutToggle, chatLayout] = createFlatToggle(
        ['LEFT', 'RIGHT'],
        '',
        preferences.incomingOnRight ? 0 : 1
    );

    createEffect(() => {
        setPreferences('incomingOnRight', chatLayout() === 'LEFT');
    });

    return <Container>
        <Title>Settings</Title>
        <Subtitle>configure experience</Subtitle>
        <Divider />
        <AuthForm>
            <ToggleCon>
                <p>CHAT LAYOUT</p>
                <Gapper/>
                {chatLayoutToggle}
            </ToggleCon>
            <ThinDivider color="gray"/>
            <button type="button" onClick={logout}>[ LOGOUT ]</button>
            <button type="button" onClick={logoutAll}>[ LOGOUT EVERYWHERE ]</button>
            <ThinDivider color="gray"/>
            <Link href="/">[ BACK ]</Link>
        </AuthForm>
        <Footer>Use input device to select user option.</Footer>
    </Container>;
}

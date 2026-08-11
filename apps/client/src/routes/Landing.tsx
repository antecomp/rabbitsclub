import { Show } from 'solid-js';
import { Container, Selector } from '../styled/shared.styles';
import Footer from '../components/Footer';
import Link from '../components/Link';
import { user } from '../api/user';
import { MANAGEMENT_PERMISSIONS } from './Manage';
import { hasPermission } from '@/api/permissions';

export default function Landing() {
    return (
        <Container>
            <Show when={!user.loading}>
                <Show
                    when={user()}
                    fallback={<Selector><Link href="/login">login</Link></Selector>}
                >
                    <Selector><Link href="/chat">chat</Link></Selector>
                    <Selector><Link href="/settings">settings</Link></Selector>
                </Show>
                <Selector><Link href="/avatar">avatar</Link></Selector>
                <Show when={MANAGEMENT_PERMISSIONS.some(hasPermission)}>
                    <Selector><Link href="/manage">manage</Link></Selector>
                </Show>
                <Show when={!user()}>
                    <Selector><Link href="/about">about</Link></Selector>
                </Show>
            </Show>
            <Footer>
                <Show when={user()}>
                    Hello, {user()?.username}. <br />
                </Show>
                Use input device to select menu options.
            </Footer>
        </Container>
    );
}

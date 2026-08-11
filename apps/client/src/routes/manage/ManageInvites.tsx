import { createSignal, For, Show } from 'solid-js';
import { api } from '../../api/backend';
import Footer from '../../components/Footer';
import { AuthForm, Divider, Subtitle, Title } from '../../styled/shared.styles';
import usePermissionGuard from '@/hooks/usePermissionGuard';
import Link from '@/components/Link';

export default function ManageInvites() {
    const [inviteCode, setInviteCode] = createSignal('');
    const [inviteLinks, setInviteLinks] = createSignal<string[]>([]);
    const [error, setError] = createSignal('');

    const canAccess = usePermissionGuard('can_manage_invites', {
        redirectTo: '/manage'
    });

    const createInviteLink = (code: string) => {
        const url = new URL(`/invite/${encodeURIComponent(code)}`, window.location.origin);
        return url.toString();
    };

    const sendInvite = async (e: SubmitEvent) => {
        e.preventDefault();
        if (!inviteCode()) return;

        setError('');
        const { data, error: err } = await api.invites.post({ code: inviteCode() });

        if (err) {
            setError(err.value.message ?? 'unable to create invite');
            return;
        }

        if (data?.code) {
            setInviteLinks(links => [createInviteLink(data.code), ...links]);
        }

        setInviteCode('');
    };

    const copyInviteLink = async (link: string) => {
        await navigator.clipboard.writeText(link);
    };

    return (
        <Show when={canAccess()}>
            <Title>Manage</Title>
            <Subtitle>Invite management</Subtitle>
            <Divider />
            <AuthForm onsubmit={sendInvite}>
                <input
                    value={inviteCode()}
                    onInput={e => setInviteCode(e.target.value)}
                    placeholder="Invite Code"
                />
                <button type="submit">[ SEND INVITE ]</button>
                <Link href="/manage">[ BACK ]</Link>
            </AuthForm>
            <Show when={inviteLinks().length > 0}>
                <AuthForm as="div">
                    <For each={inviteLinks()}>
                        {link => (
                            <>
                                <a href={link}>{link}</a>
                                <button type="button" onClick={() => copyInviteLink(link)}>[ COPY INVITE LINK ]</button>
                            </>
                        )}
                    </For>
                </AuthForm>
            </Show>
            <Footer>Create new invite by putting key in input field. <br /> {error()} </Footer>
        </Show>
    );
}

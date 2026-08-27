import { api } from '@/api/backend';
import { createDefaultAvatar, toAvatarData } from '@/avatar/avatar.const';
import { AvatarData } from '@/avatar/avatar.types';
import { AvatarCanvas } from '@/avatar/AvatarCanvas';
import usePermissionGuard from '@/hooks/usePermissionGuard';
import { AuthForm, Divider, Subtitle, ThinDivider, Title } from '@/styled/shared.styles';
import { HashRouter, Route, useNavigate, useParams } from '@solidjs/router';
import { createResource, createSignal, Show, Suspense, type ParentProps } from 'solid-js';
import { type ModerationUser } from '~/schemas/moderation.schema';
import { AvatarContainer, ManageUserGrid, ManageUserMenu } from './ManageUser.styles';
import Footer from '@/components/Footer';
import Link from '@/components/Link';
import { format } from 'date-fns';
import { styled } from 'solid-styled-components';

const StandingList = styled('div')`
    font-size: 13px;
    color: #222;
    border: solid #555 1px;
    background: #dadada;
    padding: 3px;
    border-radius: 2px;
    display: grid;
    grid-template-columns: max-content auto;

    span:nth-of-type(odd) {
        text-align: right;
    }

    span:nth-of-type(even) {
        padding-left: 10px;
    }
`

function InternalHashLink(props: ParentProps<{ href: string }>) {
    const navigate = useNavigate();

    return (
        <Link href={props.href} onClick={event => {
            event.preventDefault();
            navigate(props.href);
        }}>
            {props.children}
        </Link>
    );
}

export default function ManageUser() {
    const [errorDisplay, setErrorDisplay] = createSignal('');

    const canAccess = usePermissionGuard('can_ban_users', {
        redirectTo: '/manage'
    });

    const outerNavigate = useNavigate();
    const params = useParams<{ id: string }>();

    const [selectedUser, {refetch: refetchUser}] = createResource<ModerationUser & { avatar: AvatarData } | null>(
        async () => {
            const id = Number(params.id);
            if (!id) return null;
            const main = await api.moderation.user({ id: id })
                .get()
                .then(({ data }) => data ?? null);
            if (!main) return null;

            // todo: replace this with a get by id when we change the support there
            const avatar = await api.profile({ username: main.username })
                .get()
                .then(({ data }) => toAvatarData(data) ?? createDefaultAvatar());

            return { ...main, avatar };
        }
    );

    async function banUser(reason: string) {
        setErrorDisplay('');
        const { error } = await api.moderation.user({ id: params.id }).ban.post({ reason });

        if (error) {
            setErrorDisplay(error.value.message);
            return false;
        }

        refetchUser()
        return true;
    }

    async function unbanUser(reason: string) {
        setErrorDisplay('');
        const { error } = await api.moderation.user({ id: params.id }).unban.post({ reason });

        if (error) {
            setErrorDisplay(error.value.message ?? 'unknown error');
            return false;
        }

        refetchUser()
        return true;
    }


    return (
        <Show when={canAccess()}>
            <Title>manage</Title>
            <Subtitle>User management</Subtitle>
            <Divider />
            <Suspense fallback={<div>Loading user data...</div>}>
                <Show when={selectedUser()} fallback={
                    <AuthForm>
                        <div>user not found</div>
                        <Link href={'/manage/users'}>[ BACK ]</Link>
                    </AuthForm>
                }>
                    <AuthForm>
                        <ManageUserGrid>
                            <AvatarContainer>
                                <h3>{selectedUser()!.id}: {selectedUser()?.username}</h3>
                                <AvatarCanvas state={selectedUser()!.avatar} />
                            </AvatarContainer>
                            <ManageUserMenu>
                                <HashRouter>
                                    <Route path="/" component={() => {

                                        const bannedContext = () => {
                                            const user = selectedUser();
                                            if (!user) return null;

                                            // my back hurts.
                                            const context = {
                                                bannedBy: user.banned_by, // TODO: lookup username
                                                unbannedBy: user.unbanned_by,
                                                bannedAt: user.banned_at ? format(new Date(user.banned_at), 'dd.MM.yy') : null,
                                                unbannedAt: user.unbanned_at ? format(new Date(user.unbanned_at), 'dd.MM.yy') : null,
                                                banReason: user.banned_reason,
                                                unbanReason: user.unbanned_reason,
                                            }

                                            // no context
                                            if (Object.values(context).every(value => value == null)) return null;

                                            return context;
                                        }

                                        return (
                                            <>
                                                <StandingList>
                                                    <span>admin:</span>
                                                    <span>{String(selectedUser()?.is_admin)}</span>
                                                    <span>banned:</span>
                                                    <span>
                                                        {String(selectedUser()?.is_banned)}
                                                        <Show when={bannedContext()}>
                                                            <br />
                                                            Ban by {bannedContext()?.bannedBy ?? '???'} at {bannedContext()?.bannedAt} because: {bannedContext()?.banReason ?? 'none'}
                                                            <Show when={bannedContext()?.unbannedAt}>
                                                                <br />
                                                                Unbanned by {bannedContext()?.unbannedBy ?? '???'} at {bannedContext()?.unbannedAt ?? '???'} because {bannedContext()?.unbanReason ?? 'none'}
                                                            </Show>
                                                        </Show>
                                                    </span>
                                                </StandingList>
                                                <ThinDivider color='gray' style={{ 'margin': '5px 0px' }} />
                                                <InternalHashLink href="/ban">[ BAN ]</InternalHashLink> <br />
                                                <InternalHashLink href="/unban">[ UNBAN ]</InternalHashLink> <br />
                                                <InternalHashLink href="/roles">[ ROLES ]</InternalHashLink> <br />
                                                <button onClick={() => outerNavigate('/manage/users')}>[ BACK ]</button>
                                            </>
                                        )
                                    }} />
                                    <Route path="/ban" component={() => {
                                        const navigate = useNavigate();
                                        const [banReason, setBanReason] = createSignal('');
                                        return (<>
                                            <textarea style={{ height: '60px' }} value={banReason()} onInput={e => setBanReason(e.target.value)} maxlength={60} placeholder='Reason' /> <br />
                                            <button type='button' onClick={async () => {
                                                if (await banUser(banReason())) navigate('/');
                                            }}>[ BAN ]</button> <br />
                                            <InternalHashLink href="/">[ BACK ]</InternalHashLink> <br />
                                        </>);
                                    }} />
                                    <Route path="/unban" component={() => {
                                        const navigate = useNavigate();
                                        const [unbanReason, setUnbanReason] = createSignal('');
                                        return (<>
                                            <textarea style={{ height: '60px' }} value={unbanReason()} onInput={e => setUnbanReason(e.target.value)} maxlength={60} placeholder='Reason' /> <br />
                                            <button type='button' onClick={async () => {
                                                if (await unbanUser(unbanReason())) navigate('/');
                                            }}>[ UNBAN ]</button> <br />
                                            <InternalHashLink href="/">[ BACK ]</InternalHashLink> <br />
                                        </>);
                                    }} />
                                    <Route path="/roles" component={() =>
                                        <>
                                            Roles placeholder <br />
                                            <InternalHashLink href="/">[ BACK ]</InternalHashLink> <br />
                                        </>
                                    } />
                                </HashRouter>
                            </ManageUserMenu>
                        </ManageUserGrid>
                    </AuthForm>
                    <Footer>Their fate is in your hands. <br /> {errorDisplay()}</Footer>
                </Show>
            </Suspense>
        </Show >
    );
}

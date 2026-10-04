import { api } from '@/api/backend';
import { createDefaultAvatar, toAvatarData } from '@/avatar/avatar.const';
import { AvatarCanvas } from '@/avatar/AvatarCanvas';
import usePermissionGuard from '@/hooks/usePermissionGuard';
import { AuthForm, Divider, Subtitle, Title } from '@/styled/shared.styles';
import { HashRouter, Route, useNavigate, useParams } from '@solidjs/router';
import { createResource, createSignal, Show, Suspense } from 'solid-js';
import { AvatarContainer, ManageUserGrid, ManageUserMenu } from './ManageUser.styles';
import Footer from '@/components/Footer';
import Link from '@/components/Link';
import { toModerationSummary } from './moderationSummary';
import type { ManageUserPresentationModel } from './manageuser.types';
import { InternalHashLink } from './manage-user/InternalHashLink';
import ManageUserOverview from './manage-user/ManageUserOverview';

export default function ManageUser() {
    const [errorDisplay, setErrorDisplay] = createSignal('');

    const canAccess = usePermissionGuard('can_ban_users', {
        redirectTo: '/manage'
    });

    const outerNavigate = useNavigate();
    const params = useParams<{ id: string }>();

    const [selectedUser, { refetch: refetchUser }] = createResource<
        ManageUserPresentationModel | null
    >(
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

            return {
                ...main,
                avatar,
                moderation: toModerationSummary(main)
            };
        }
    );

    async function banUser(reason: string) {
        setErrorDisplay('');
        const { error } = await api.moderation.user({ id: params.id }).ban.post({ reason });

        if (error) {
            setErrorDisplay(error.value.message);
            return false;
        }

        refetchUser();
        return true;
    }

    async function unbanUser(reason: string) {
        setErrorDisplay('');
        const { error } = await api.moderation.user({ id: params.id }).unban.post({ reason });

        if (error) {
            setErrorDisplay(error.value.message ?? 'unknown error');
            return false;
        }

        refetchUser();
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
                                    <Route path="/"
                                        component={() => <ManageUserOverview
                                            {...selectedUser()!} onBack={() => outerNavigate('/manage/users')}
                                        />}
                                    />
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

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
import ManageUserActionForm from './manage-user/ManageUserActionForm';
import ManageUserRoles from './manage-user/ManageUserRoles';
import ManageUserOverview from './manage-user/ManageUserOverview';
import { UserPermissions } from '~/schemas/moderation.schema';

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

    async function updateUserPermissions(to: UserPermissions) {
        setErrorDisplay('');
        const { error } = await api.admin.users({ id: params.id }).permissions.patch(to);
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
                                    <Route path="/ban"
                                        component={() => <ManageUserActionForm label="BAN" onSubmit={banUser} />}
                                    />
                                    <Route path="/unban"
                                        component={() => <ManageUserActionForm label="UNBAN" onSubmit={unbanUser} />}
                                    />
                                    <Route path="/roles" component={() => <ManageUserRoles {...selectedUser()!} update={updateUserPermissions} />} />
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

import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import { AvatarCanvas } from "../avatar/AvatarCanvas";
import Footer from "../components/Footer";
import { EyeVariant, clampedHeadVariant, eyeVariants, eyes, heads, isEyeVariant } from "../avatar/avatar.assets";
import { Divider, Subtitle, Title } from "../styled/shared.styles";
import { createStore } from "solid-js/store";
import { api } from "../api/backend";
import { user } from "../api/user";
import { invalidateCachedProfile } from "../avatar/avatarCache";
import { DEFAULT_AVATAR } from "@/avatar/avatar.const";
import { AvatarData } from "@/avatar/avatar.types";
import { AvatarContainer, BackButton, Menu, MenuButton, MenuTitle, MiniDivider, OffsetButton, OffsetControls, Split, ThumbnailButton, ThumbnailGrid } from "./Avatar.styles";

import arrow from '../assets/ui/dir.png';
import center from '../assets/ui/center.png';
import { createRandomAvatar } from "@/avatar/createRandomAvatar";

type AvatarMenu = 'root' | 'ears' | 'leftEye' | 'rightEye';

const EYE_OFFSET_STEP = 4;

const directions: { x: number; y: number; rotation: number; gridColumn: number; gridRow: number; label: string }[] = [
    { x: 0, y: -EYE_OFFSET_STEP, rotation: -90, gridColumn: 2, gridRow: 1, label: 'Move eye up' },
    { x: -EYE_OFFSET_STEP, y: 0, rotation: 180, gridColumn: 1, gridRow: 2, label: 'Move eye left' },
    { x: EYE_OFFSET_STEP, y: 0, rotation: 0, gridColumn: 3, gridRow: 2, label: 'Move eye right' },
    { x: 0, y: EYE_OFFSET_STEP, rotation: 90, gridColumn: 2, gridRow: 3, label: 'Move eye down' },
];

function EyeOffsetControls(props: { setOffset: (x: number, y: number) => void; onReset: () => void }) {
    return (
        <OffsetControls aria-label="Eye position controls">
            <For each={directions}>
                {({ x, y, rotation, gridColumn, gridRow, label }) => (
                    <OffsetButton
                        type="button"
                        aria-label={label}
                        title={label}
                        onClick={() => props.setOffset(x, y)}
                        style={{ 'grid-column': gridColumn, 'grid-row': gridRow }}
                    >
                        <img src={arrow} alt="" style={{ transform: `rotate(${rotation}deg)` }} />
                    </OffsetButton>
                )}
            </For>
            <OffsetButton
                type="button"
                aria-label="Reset eye position"
                title={"Reset eye position"}
                onClick={props.onReset}
                style={{ 'grid-column': 2, 'grid-row': 2 }}
            >
                <img src={center} alt="" />
            </OffsetButton>
        </OffsetControls>
    );
}

export default function Avatar() {
    const navigate = useNavigate();
    const [menu, setMenu] = createSignal<AvatarMenu>('root');
    const [avatar, setAvatar] = createStore<AvatarData>({ ...DEFAULT_AVATAR });
    let loadedUsername: string | undefined;

    const eyeThumbnail = (variant: EyeVariant, side: 0 | 1) => {
        const src = eyes[variant].src;
        return Array.isArray(src) ? src[side] : src;
    }

    const moveEye = (side: 'leftEyeOffset' | 'rightEyeOffset', x: number, y: number) => {
        setAvatar(side, 'x', v => v + x);
        setAvatar(side, 'y', v => v + y);
    }

    const resetEye = (side: 'leftEyeOffset' | 'rightEyeOffset') => {
        setAvatar(side, { x: 0, y: 0 });
    }

    const save = async () => {
        await api.profile.avatar.put({ ...avatar })
        const username = user()?.username;
        if (username) invalidateCachedProfile(username);
        navigate("/");
    }

    createEffect(() => {
        if (user.loading) return;

        const username = user()?.username;
        if (!username) {
            loadedUsername = undefined;
            return;
        }

        if (loadedUsername === username) return;
        loadedUsername = username;

        void (async () => {
            const profile = (await api.profile({ username }).get()).data;
            if (loadedUsername !== username || !profile) return;

            setAvatar({
                ...DEFAULT_AVATAR,
                ...profile,
                leftEye: isEyeVariant(profile.leftEye) ? profile.leftEye : DEFAULT_AVATAR.leftEye,
                rightEye: isEyeVariant(profile.rightEye) ? profile.rightEye : DEFAULT_AVATAR.rightEye,
                head: clampedHeadVariant(profile.head)
            });
        })();
    });

    const menuDescription = () => ({
        ears: 'Select ear variation by clicking preview buttons.',
        leftEye: 'Select eye variation by clicking preview buttons. Shift eye position using arrow buttons.',
        rightEye: 'Select eye variation by clicking preview buttons. Shift eye position using arrow buttons.',
        root: 'Select options on the right to customize rabbit.'
    } satisfies Record<AvatarMenu, string>)[menu()]

    return (
        <AvatarContainer>
            <Title>avatar</Title>
            <Subtitle>rabbit customization</Subtitle>
            <Divider />
            <Split>
                <AvatarCanvas state={avatar} />
                <Menu>
                    <Switch>
                        <Match when={menu() === 'root'}>
                            <MenuButton type="button" onClick={() => setMenu('ears')}>[ EARS ]</MenuButton>
                            <MenuButton type="button" onClick={() => setMenu('leftEye')}>[ EYE L ]</MenuButton>
                            <MenuButton type="button" onClick={() => setMenu('rightEye')}>[ EYE R ]</MenuButton>
                            <MiniDivider/>
                            <MenuButton type="button" onClick={() => setAvatar(createRandomAvatar())}>[ RANDOM ]</MenuButton>
                            <Show when={user()}>
                                <MenuButton type="button" onClick={save}>[ SAVE ]</MenuButton>
                            </Show>
                            <MenuButton type="button" onClick={() => navigate("/")}>[ BACK ]</MenuButton>
                        </Match>
                        <Match when={menu() === 'ears'}>
                            <MenuTitle>
                                <BackButton type="button" onClick={() => setMenu('root')}>[ BACK ]</BackButton>
                                <p>EARS</p>
                            </MenuTitle>
                            <ThumbnailGrid>
                                <For each={heads}>
                                    {(head, index) => (
                                        <ThumbnailButton
                                            type="button"
                                            data-selected={avatar.head === index()}
                                            aria-pressed={avatar.head === index()}
                                            onClick={() => setAvatar('head', index())}
                                        >
                                            <img src={head} alt={`Ears ${index() + 1}`} />
                                            {index() + 1}
                                        </ThumbnailButton>
                                    )}
                                </For>
                            </ThumbnailGrid>
                        </Match>
                        <Match when={menu() === 'leftEye'}>
                            <MenuTitle>
                                <BackButton type="button" onClick={() => setMenu('root')}>[ BACK ]</BackButton>
                                <p>LEFT EYE</p>
                            </MenuTitle>
                            <EyeOffsetControls
                                setOffset={(x, y) => moveEye('leftEyeOffset', x, y)}
                                onReset={() => resetEye('leftEyeOffset')}
                            />
                            <ThumbnailGrid>
                                <For each={eyeVariants}>
                                    {eye => (
                                        <ThumbnailButton
                                            type="button"
                                            data-selected={avatar.leftEye === eye}
                                            aria-pressed={avatar.leftEye === eye}
                                            onClick={() => setAvatar('leftEye', eye)}
                                        >
                                            <img src={eyeThumbnail(eye, 0)} alt={`${eye} left eye`} />
                                            {eye}
                                        </ThumbnailButton>
                                    )}
                                </For>
                            </ThumbnailGrid>
                        </Match>
                        <Match when={menu() === 'rightEye'}>
                            <MenuTitle>
                                <BackButton type="button" onClick={() => setMenu('root')}>[ BACK ]</BackButton>
                                <p>RIGHT EYE</p>
                            </MenuTitle>
                            <EyeOffsetControls
                                setOffset={(x, y) => moveEye('rightEyeOffset', x, y)}
                                onReset={() => resetEye('rightEyeOffset')}
                            />
                            <ThumbnailGrid>
                                <For each={eyeVariants}>
                                    {eye => (
                                        <ThumbnailButton
                                            type="button"
                                            data-selected={avatar.rightEye === eye}
                                            aria-pressed={avatar.rightEye === eye}
                                            onClick={() => setAvatar('rightEye', eye)}
                                        >
                                            <img src={eyeThumbnail(eye, 1)} alt={`${eye} right eye`} />
                                            {eye}
                                        </ThumbnailButton>
                                    )}
                                </For>
                            </ThumbnailGrid>
                        </Match>
                    </Switch>
                </Menu>
            </Split>
            <Footer>
                {menuDescription()}
            </Footer>
        </AvatarContainer>
    )
}
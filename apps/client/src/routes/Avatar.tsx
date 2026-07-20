import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import { AvatarCanvas } from "../avatar/AvatarCanvas";
import Footer from "../components/Footer";
import { EyeVariant, eyeVariants, eyes, heads } from "../avatar/avatar.assets";
import { Divider, Subtitle, Title } from "../styled/shared.styles";
import { createStore } from "solid-js/store";
import { api } from "../api/backend";
import { user } from "../api/user";
import { invalidateCachedProfile } from "../avatar/avatarCache";
import { createDefaultAvatar, normalizeAvatarData } from "@/avatar/avatar.const";
import { AvatarData } from "@/avatar/avatar.types";
import { AvatarContainer, BackButton, Menu, MenuButton, MenuTitle, MiniDivider, OffsetButton, OffsetControls, Split, ThumbnailButton, ThumbnailGrid } from "./Avatar.styles";

import arrow from '../assets/ui/dir.png';
import center from '../assets/ui/center.png';
import turn from '../assets/ui/turn.png';

import { createRandomAvatar } from "@/avatar/createRandomAvatar";

type AvatarMenu = 'root' | 'ears' | 'leftEye' | 'rightEye';

const EYE_OFFSET_STEP = 4;
const EYE_ROTATION_STEP = 5;

const directions: { x: number; y: number; rotation: number; gridColumn: number; gridRow: number; label: string }[] = [
    { x: 0, y: -EYE_OFFSET_STEP, rotation: -90, gridColumn: 2, gridRow: 1, label: 'Move eye up' },
    { x: -EYE_OFFSET_STEP, y: 0, rotation: 180, gridColumn: 1, gridRow: 2, label: 'Move eye left' },
    { x: EYE_OFFSET_STEP, y: 0, rotation: 0, gridColumn: 3, gridRow: 2, label: 'Move eye right' },
    { x: 0, y: EYE_OFFSET_STEP, rotation: 90, gridColumn: 2, gridRow: 3, label: 'Move eye down' },
];

const rotations: { delta: number; gridColumn: number; label: string; mirrored?: boolean }[] = [
    { delta: -EYE_ROTATION_STEP, gridColumn: 1, label: 'Turn eye counterclockwise', mirrored: true },
    { delta: EYE_ROTATION_STEP, gridColumn: 3, label: 'Turn eye clockwise' },
];

// Directional control cluster for nudging one eye's avatar offset and rotation.
function EyeOffsetControls(props: {
    setOffset: (x: number, y: number) => void;
    setRotation: (delta: number) => void;
    onReset: () => void;
}) {
    return (
        <OffsetControls aria-label="Eye transform controls">
            <For each={rotations}>
                {({ delta, gridColumn, label, mirrored }) => (
                    <OffsetButton
                        type="button"
                        aria-label={label}
                        title={label}
                        onClick={() => props.setRotation(delta)}
                        style={{ 'grid-column': gridColumn, 'grid-row': 1 }}
                    >
                        <img src={turn} alt="" style={mirrored ? { transform: 'scaleX(-1)' } : undefined} />
                    </OffsetButton>
                )}
            </For>
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
                aria-label="Reset eye transform"
                title={"Reset eye transform"}
                onClick={props.onReset}
                style={{ 'grid-column': 2, 'grid-row': 2 }}
            >
                <img src={center} alt="" />
            </OffsetButton>
        </OffsetControls>
    );
}

/** Avatar customization route for editing head, eye variants, and eye offsets. */
export default function Avatar() {
    const navigate = useNavigate();
    const [menu, setMenu] = createSignal<AvatarMenu>('root');
    const [avatar, setAvatar] = createStore<AvatarData>(createDefaultAvatar());
    let loadedUsername: string | undefined;

    const eyeThumbnail = (variant: EyeVariant, side: 0 | 1) => {
        const src = eyes[variant].src;
        return Array.isArray(src) ? src[side] : src;
    }

    const moveEye = (side: 'leftEye' | 'rightEye', x: number, y: number) => {
        setAvatar(side, 'offset', 'x', v => v + x);
        setAvatar(side, 'offset', 'y', v => v + y);
    }

    const rotateEye = (side: 'leftEye' | 'rightEye', delta: number) => {
        setAvatar(side, 'rotation', v => v + delta);
    }

    const resetEye = (side: 'leftEye' | 'rightEye') => {
        setAvatar(side, 'offset', { x: 0, y: 0 });
        setAvatar(side, 'rotation', 0);
    }

    const save = async () => {
        const { error } = await api.profile.avatar.put({ ...avatar });
        if(error) return;
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

            setAvatar(normalizeAvatarData(profile));
        })();
    });

    const menuDescription = () => ({
        ears: 'Select ear variation by clicking preview buttons.',
        leftEye: 'Select eye variation by clicking preview buttons. Transform it using the control buttons.',
        rightEye: 'Select eye variation by clicking preview buttons. Transform it using the control buttons.',
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
                                setOffset={(x, y) => moveEye('leftEye', x, y)}
                                setRotation={delta => rotateEye('leftEye', delta)}
                                onReset={() => resetEye('leftEye')}
                            />
                            <ThumbnailGrid>
                                <For each={eyeVariants}>
                                    {eye => (
                                        <ThumbnailButton
                                            type="button"
                                            data-selected={avatar.leftEye.variant === eye}
                                            aria-pressed={avatar.leftEye.variant === eye}
                                            onClick={() => setAvatar('leftEye', 'variant', eye)}
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
                                setOffset={(x, y) => moveEye('rightEye', x, y)}
                                setRotation={delta => rotateEye('rightEye', delta)}
                                onReset={() => resetEye('rightEye')}
                            />
                            <ThumbnailGrid>
                                <For each={eyeVariants}>
                                    {eye => (
                                        <ThumbnailButton
                                            type="button"
                                            data-selected={avatar.rightEye.variant === eye}
                                            aria-pressed={avatar.rightEye.variant === eye}
                                            onClick={() => setAvatar('rightEye', 'variant', eye)}
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

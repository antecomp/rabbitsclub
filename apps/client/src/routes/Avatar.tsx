import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import { AvatarCanvas } from "../avatar/AvatarCanvas";
import Footer from "../components/Footer";
import { EyeVariant, clampedHeadVariant, eyeVariants, eyes, heads, isEyeVariant } from "../avatar/avatar.assets";
import { Divider, Subtitle, Title } from "../styled/MainMenu";
import { createStore, SetStoreFunction } from "solid-js/store";
import { api } from "../api/backend";
import { user } from "../api/user"; 
import { invalidateCachedProfile } from "../avatar/avatarCache";
import { DEFAULT_AVATAR } from "@/avatar/avatar.const";
import { AvatarContainer, BackButton, Menu, MenuButton, MenuTitle, OffsetButton, OffsetControls, Split, ThumbnailButton, ThumbnailGrid } from "./Avatar.styles";

import arrow from '../assets/ui/dir.png';
import center from '../assets/ui/center.png';

type AvatarMenu = 'root' | 'ears' | 'leftEye' | 'rightEye';
type EyeOffset = { x: number; y: number };

const EYE_OFFSET_STEP = 4;

const directions: { x: number; y: number; rotation: number; gridColumn: number; gridRow: number; label: string }[] = [
    { x: 0, y: -EYE_OFFSET_STEP, rotation: -90, gridColumn: 2, gridRow: 1, label: 'Move eye up' },
    { x: -EYE_OFFSET_STEP, y: 0, rotation: 180, gridColumn: 1, gridRow: 2, label: 'Move eye left' },
    { x: EYE_OFFSET_STEP, y: 0, rotation: 0, gridColumn: 3, gridRow: 2, label: 'Move eye right' },
    { x: 0, y: EYE_OFFSET_STEP, rotation: 90, gridColumn: 2, gridRow: 3, label: 'Move eye down' },
];

function EyeOffsetControls(props: { setOffset: SetStoreFunction<EyeOffset> }) {
    const move = (x: number, y: number) => {
        props.setOffset('x', value => value + x);
        props.setOffset('y', value => value + y);
    }

    const reset = () => {
        props.setOffset({ x: 0, y: 0 });
    }

    return (
        <OffsetControls aria-label="Eye position controls">
            <For each={directions}>
                {({ x, y, rotation, gridColumn, gridRow, label }) => (
                    <OffsetButton
                        type="button"
                        aria-label={label}
                        onClick={() => move(x, y)}
                        style={{ 'grid-column': gridColumn, 'grid-row': gridRow }}
                    >
                        <img src={arrow} alt="" style={{ transform: `rotate(${rotation}deg)` }} />
                    </OffsetButton>
                )}
            </For>
            <OffsetButton
                type="button"
                aria-label="Reset eye position"
                onClick={reset}
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
    const [variant, setVariant] = createSignal(0);
    const [leye, setLeye] = createSignal<EyeVariant>('bead');
    const [reye, setReye] = createSignal<EyeVariant>('bead');

    const [leftOffset, setLeftOffset] = createStore<EyeOffset>({ x: 0, y: 0 });
    const [rightOffset, setRightOffset] = createStore<EyeOffset>({ x: 0, y: 0 });
    let loadedUsername: string | undefined;

    const eyeThumbnail = (variant: EyeVariant, side: 0 | 1) => {
        const src = eyes[variant].src;
        return Array.isArray(src) ? src[side] : src;
    }

    const save = async () => {
        await api.profile.avatar.put({
            head: variant(),
            leftEye: leye(),
            rightEye: reye(),
            leftEyeOffset: { x: leftOffset.x, y: leftOffset.y },
            rightEyeOffset: { x: rightOffset.x, y: rightOffset.y }
        })
        navigate("/");

        const username = user()?.username;
        if (username) invalidateCachedProfile(username);
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

            setVariant(clampedHeadVariant(profile.head));
            setLeye(isEyeVariant(profile.leftEye) ? profile.leftEye : DEFAULT_AVATAR.leftEye);
            setReye(isEyeVariant(profile.rightEye) ? profile.rightEye : DEFAULT_AVATAR.rightEye);
            setLeftOffset(profile.leftEyeOffset);
            setRightOffset(profile.rightEyeOffset);
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
                <AvatarCanvas
                    state={{
                        head: variant(),
                        leftEye: leye(),
                        rightEye: reye(),
                        leftEyeOffset: { x: leftOffset.x, y: leftOffset.y },
                        rightEyeOffset: { x: rightOffset.x, y: rightOffset.y },
                    }}
                />
                <Menu>
                    <Switch>
                        <Match when={menu() === 'root'}>
                            <MenuButton type="button" onClick={() => setMenu('ears')}>[ EARS ]</MenuButton>
                            <MenuButton type="button" onClick={() => setMenu('leftEye')}>[ EYE L ]</MenuButton>
                            <MenuButton type="button" onClick={() => setMenu('rightEye')}>[ EYE R ]</MenuButton>
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
                                            data-selected={variant() === index()}
                                            aria-pressed={variant() === index()}
                                            onClick={() => setVariant(index())}
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
                            <EyeOffsetControls setOffset={setLeftOffset} />
                            <ThumbnailGrid>
                                <For each={eyeVariants}>
                                    {eye => (
                                        <ThumbnailButton
                                            type="button"
                                            data-selected={leye() === eye}
                                            aria-pressed={leye() === eye}
                                            onClick={() => setLeye(eye)}
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
                            <EyeOffsetControls setOffset={setRightOffset} />
                            <ThumbnailGrid>
                                <For each={eyeVariants}>
                                    {eye => (
                                        <ThumbnailButton
                                            type="button"
                                            data-selected={reye() === eye}
                                            aria-pressed={reye() === eye}
                                            onClick={() => setReye(eye)}
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

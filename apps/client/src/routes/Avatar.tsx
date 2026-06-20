import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, For, Match, Switch } from "solid-js";
import { AvatarCanvas } from "../avatar/AvatarCanvas";
import Footer from "../components/Footer";
import { styled } from "solid-styled-components";
import { EyeVariant, eyeVariants, eyes, heads } from "../avatar/assets";
import { Divider, Subtitle, Title } from "../styled/MainMenu";
import cbr from '../assets/ui/c_br.png';
import arrow from '../assets/ui/dir.png';
import center from '../assets/ui/center.png';
import { createStore, SetStoreFunction } from "solid-js/store";
import { api } from "../api/backend";
import { user } from "../api/user";
import { SuggestedString } from "../types/misc.types";
import { invalidateProfile } from "../avatar/avatarCache";

const AvatarContainer = styled("div")`
    position: absolute;
    top: 40%;
    left: 10vw;
    transform: translate(0%, -50%);
    max-width: 580px;
    width: 70vw;
    height: 300px;
    user-select: none;
    animation: flicker-in 0.3s steps(12, end) forwards;
`

const Split = styled('div')`
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 10px;
    height: 100%;
    padding-bottom: 10px;
    padding-top: 10px;

    canvas {
        width: 100%;
        overflow: hidden;
        height: 100%;
        object-fit: contain;

        background: url(${cbr});

        --bevel: 20px;

        clip-path: polygon(
            var(--bevel) 0,
            calc(100% - var(--bevel)) 0,
            100% var(--bevel),
            100% calc(100% - var(--bevel)),
            calc(100% - var(--bevel)) 100%,
            var(--bevel) 100%,
            0 calc(100% - var(--bevel)),
            0 var(--bevel)
        );
    }
`

const Menu = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    box-sizing: border-box;

    height: 100%;
    /* min-height: 0; */
    /* overflow: auto; */
    overflow: hidden;
`

const MenuButton = styled('button')`
    border: none;
    background: none;
    padding: 0;
    font-size: 18px;

    &:hover, &:focus {
        color: gray;
        cursor: pointer;
        outline: none;
    }
`

const MenuTitle = styled('div')`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
    font-size: 18px;
`

const BackButton = styled('button')`
    border: none;
    background: none;
    padding: 0;
    font-size: 18px;

    &:hover, &:focus {
        color: gray;
        cursor: pointer;
        outline: none;
    }
`

const ThumbnailGrid = styled('div')`
    gap: 4px;
    width: 100%;
    overflow: auto;
    padding: 1px;
    display: flex;
    flex-wrap: wrap;
`

const ThumbnailButton = styled('button')`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 78px;
    padding: 6px;
    border: 1px solid black;
    outline: 1px solid transparent;
    background: #aaa;
    font-family: 'main';
    font-size: 0.8rem;
    aspect-ratio: 1;
    flex-grow: 1;
    max-width: 32%;

    &:hover, &:focus {
        background: lightgray;
        cursor: pointer;
        outline-color: gray;
    }

    &[data-selected='true'] {
        outline: 1px solid black;
        background: #ddd;
    }

    img {
        max-width: 48px;
        max-height: 48px;
        image-rendering: pixelated;
        object-fit: contain;
        flex-grow: 1;
    }
`

const OffsetControls = styled('div')`
    display: grid;
    grid-template-columns: repeat(3, 15px);
    grid-template-rows: repeat(3, 15px);
    gap: 1px;
    margin-bottom: 5px;
    align-self: center;
`

const OffsetButton = styled('button')`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;

    &:hover, &:focus {
        filter: brightness(1.5);
        cursor: pointer;
    }

    img {
        object-fit: contain;
        image-rendering: pixelated;
    }
`

type AvatarMenu = 'root' | 'ears' | 'leftEye' | 'rightEye';
type EyeOffset = { x: number; y: number };

const OFFSET_STEP = 4;

const directions: { x: number; y: number; rotation: number; gridColumn: number; gridRow: number; label: string }[] = [
    { x: 0, y: -OFFSET_STEP, rotation: -90, gridColumn: 2, gridRow: 1, label: 'Move eye up' },
    { x: -OFFSET_STEP, y: 0, rotation: 180, gridColumn: 1, gridRow: 2, label: 'Move eye left' },
    { x: OFFSET_STEP, y: 0, rotation: 0, gridColumn: 3, gridRow: 2, label: 'Move eye right' },
    { x: 0, y: OFFSET_STEP, rotation: 90, gridColumn: 2, gridRow: 3, label: 'Move eye down' },
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
    const [leye, setLeye] = createSignal<SuggestedString<EyeVariant>>('bead');
    const [reye, setReye] = createSignal<SuggestedString<EyeVariant>>('bead');

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
        if (username) invalidateProfile(username);
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

            setVariant(profile.head);
            setLeye(profile.leftEye);
            setReye(profile.rightEye);
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
                            <MenuButton type="button" onClick={() => setMenu('leftEye')}>[ LEFT EYE ]</MenuButton>
                            <MenuButton type="button" onClick={() => setMenu('rightEye')}>[ RIGHT EYE ]</MenuButton>
                            <MenuButton type="button" onClick={save}>[ SAVE ]</MenuButton>
                            <MenuButton type="button" onClick={() => navigate("/")}>[ BACK ]</MenuButton>
                        </Match>
                        <Match when={menu() === 'ears'}>
                            <MenuTitle>
                                EARS
                                <BackButton type="button" onClick={() => setMenu('root')}>[ BACK ]</BackButton>
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
                                LEFT EYE
                                <BackButton type="button" onClick={() => setMenu('root')}>[ BACK ]</BackButton>
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
                                RIGHT EYE
                                <BackButton type="button" onClick={() => setMenu('root')}>[ BACK ]</BackButton>
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

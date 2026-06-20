import { useNavigate } from "@solidjs/router";
import { createSignal, For, Match, Switch } from "solid-js";
import { AvatarCanvas } from "../avatar/AvatarCanvas";
import Footer from "../components/Footer";
import { styled } from "solid-styled-components";
import { EyeVariant, eyeVariants, eyes, heads } from "../avatar/assets";
import { Divider, Subtitle, Title } from "../styled/MainMenu";

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
    grid-template-columns: 5fr 4fr;
    gap: 10px;
    height: 100%;
    padding-bottom: 10px;

    canvas {
        width: 100%;
        overflow: hidden;
        height: 100%;
        object-fit: contain;
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
    padding: 4px;
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
        outline: 2px solid black;
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

type AvatarMenu = 'root' | 'ears' | 'leftEye' | 'rightEye';

export default function Avatar() {
    const navigate = useNavigate();
    const [menu, setMenu] = createSignal<AvatarMenu>('root');
    const [variant, setVariant] = createSignal(0);
    const [leye, setLeye] = createSignal<EyeVariant>('bead');
    const [reye, setReye] = createSignal<EyeVariant>('bead');

    const eyeThumbnail = (variant: EyeVariant, side: 0 | 1) => {
        const src = eyes[variant].src;
        return Array.isArray(src) ? src[side] : src;
    }

    return (
        <AvatarContainer>
            <Title>avatar</Title>
            <Subtitle>Rabbit Generation System</Subtitle>
            <Divider />
            <Split>
                <AvatarCanvas state={{ head: variant(), leftEye: leye(), rightEye: reye(), leftEyeOffset: { x: 0, y: 0 }, rightEyeOffset: { x: 0, y: 0 } }} />
                <Menu>
                    <Switch>
                        <Match when={menu() === 'root'}>
                            <MenuButton type="button" onClick={() => setMenu('ears')}>[ EARS ]</MenuButton>
                            <MenuButton type="button" onClick={() => setMenu('leftEye')}>[ LEFT EYE ]</MenuButton>
                            <MenuButton type="button" onClick={() => setMenu('rightEye')}>[ RIGHT EYE ]</MenuButton>
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
                                {/* again for overflow */}
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
                Use options to customize rabbit.
            </Footer>
        </AvatarContainer>
    )
}

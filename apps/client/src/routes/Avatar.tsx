import { createSignal, For } from "solid-js";
import { AvatarCanvas } from "../avatar/AvatarCanvas";
import { Container, Divider, Subtitle, Title } from "../styled/MainMenu";
import Footer from "../components/Footer";
import { styled } from "solid-styled-components";
import { EyeVariant, eyeVariants } from "../avatar/assets";

const Split = styled('div')`
    display: grid;
    grid-template-columns: min-content auto;
    padding: 10px 0px;

    div {
        
    }
`

export default function Avatar() {
    const [variant, setVariant] = createSignal(0);
    const [leye, setLeye] = createSignal<EyeVariant>('bead');
    const [reye, setReye] = createSignal<EyeVariant>('bead');

    return (
        <Container>
            <Title>avatar</Title>
            <Subtitle>Rabbit Generation System</Subtitle>
            <Divider />
            <Split>
                <AvatarCanvas state={{ head: variant(), leftEye: leye(), rightEye: reye(), leftEyeOffset: { x: 0, y: 0 }, rightEyeOffset: { x: 0, y: 0 } }} />
                <div>
                    EARS:
                    <button onclick={() => setVariant(p => p - 1)}>[ PREV ]</button>
                    <button onclick={() => setVariant(p => p + 1)}>[ NEXT ]</button>
                    <br />
                    left eye:
                    <select
                        value={leye()}
                        onChange={(e) => setLeye(e.target.value as EyeVariant)}
                    >
                        <For each={eyeVariants}>
                            {variant => <option value={variant}>{variant}</option>}
                        </For>
                    </select>
                    <br />
                    right eye:
                    <select
                        value={reye()}
                        onChange={(e) => setReye(e.target.value as EyeVariant)}
                    >
                        <For each={eyeVariants}>
                            {variant => <option value={variant}>{variant}</option>}
                        </For>
                    </select>
                </div>
            </Split>
            <Footer>
                Use options to customize rabbit.
            </Footer>
        </Container>
    )
}
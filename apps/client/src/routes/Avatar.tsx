import { createSignal } from "solid-js";
import { AvatarCanvas } from "../avatar/AvatarCanvas";
import { Container, Divider, Subtitle, Title } from "../styled/MainMenu";

export default function Avatar() {
    const [variant, setVariant] = createSignal(0);

    return (
        <Container>
            <Title>avatar</Title>
            <Subtitle>Rabbit Generation System</Subtitle>
            <Divider/>
            <AvatarCanvas state={{head: variant()}}/>
            <br />
            <button onclick={() => setVariant(p => p + 1)}>[ NEXT ]</button>
            <br />
            <button onclick={() => setVariant(p => p - 1)}>[ PREV ]</button>
        </Container>
    )
}
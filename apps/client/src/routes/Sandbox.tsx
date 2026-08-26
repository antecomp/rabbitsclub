import Footer from '@/components/Footer';
import Link from '@/components/Link';
import createFlatToggle from '@/components/toggles/FlatToggle';
import createStackedToggle from '@/components/toggles/StackedToggle';
import { Container, Divider, Subtitle, Title } from '@/styled/shared.styles';
import { styled } from 'solid-styled-components';

const SandboxContent = styled('main')`
    flex: 1;
    padding: 10px;
    overflow: auto;
`;

export default function Sandbox() {
    const [stacked, sel] = createStackedToggle(['first', 'second', 'third'])
    const [horiz, sel2] = createFlatToggle(['rabbit', 'bunny', 'hare'], 'caption here');

    return (
        <Container>
            <Title>Sandbox</Title>
            <Subtitle>interface playground</Subtitle>
            <Divider />
            <SandboxContent>
                Testing the stacked toggle switch. You currently selected {sel()};
                {stacked}
                <br />
                Testing the flat toggle. You selected {sel2()}
                {horiz}
            </SandboxContent>
            <Footer>
                Temporary workspace for testing UI components. <br />
                <Link href="/">[ HOME ]</Link>
            </Footer>
        </Container>
    );
}

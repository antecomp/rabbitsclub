import type { ParentProps } from "solid-js"
import { Container } from "../styled/shared.styles";

export default function Manage(props: ParentProps) {
    return <Container>
        {props.children}
    </Container>
}

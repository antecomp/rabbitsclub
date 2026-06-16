import { createResource, ParentProps } from "solid-js";
import { BE } from "../api";
import { styled } from "solid-styled-components";

const FooterContainer = styled('footer')`
    margin-top: 3vh;
    display: grid;
    grid-template-columns: auto auto;
    >div:first-child {
        border-right: solid black 2px;
    }
`

export default function Footer(props: ParentProps) {
    const [status] = createResource(async () => {
        const rez = (await BE.health.get()).data;
        return rez?.status;
    })

    return <FooterContainer>
        <div>
            RABBITS.CLUB v1.0 <br />
            {status() ? 'ONLINE' : 'UNAVAILABLE'}
        </div>
        <div>
            {props.children}
        </div>
    </FooterContainer>
}
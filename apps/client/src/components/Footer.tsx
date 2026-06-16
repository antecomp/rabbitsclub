import { createResource, ParentProps } from "solid-js";
import { BE } from "../api";
import { styled } from "solid-styled-components";

const FooterContainer = styled('footer')`
    margin-top: auto;
    width: 100%;
    display: flex;
    >div:first-child {
        border-right: solid black 2px;
        width: auto;
    }
    >div {
        padding: 10px;
    }
    span {
        white-space: nowrap;
    }
`


// Raised global to prevent requery on mount;
const [status] = createResource(async () => {
    const rez = (await BE.health.get()).data;
    return rez?.status;
})

export default function Footer(props: ParentProps) {
    return <FooterContainer>
        <div>
            <span>RABBITS.CLUB v1.0</span> <br />
            {status.loading
                ? 'LOADING'
                : status() ? ' • ONLINE' : 'UNAVAILABLE'
            }
        </div>
        <div>
            {props.children}
        </div>
    </FooterContainer>
}
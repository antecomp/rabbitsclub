import { createResource, ParentProps } from "solid-js";
import { api } from "../api/backend";
import { styled } from "solid-styled-components";

const FooterContainer = styled('footer')<{showborder: boolean}>`
    margin-top: auto;
    width: 100%;
    display: flex;
    >div:first-child {
        border-right: ${props => props.showborder ? 'solid black 2px' : 'none'};
        width: auto;
    }
    >div {
        padding: 10px;
    }
    span {
        white-space: nowrap;
    }
`

// Raised global to prevent a health request every time the footer mounts.
const [status] = createResource(async () => {
    const rez = (await api.health.get()).data;
    return rez?.status;
})

/** Shared footer that displays application health and optional contextual text. */
export default function Footer(props: ParentProps) {
    return <FooterContainer showborder={!!props.children}>
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

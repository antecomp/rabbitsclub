import { useNavigate } from "@solidjs/router";
import { For, Show } from "solid-js";
import { styled } from "solid-styled-components";

const MAX_ONLINE_VISIBLE = 3;

const Body = styled('aside')`
    text-align: right;
    padding: 5px;
    min-width: 0;

    button {
        display: block;
        font-size: 1em;
        border: none;
        background: none;
        margin-left: auto;
    }

    button:hover, button:focus {
        color: gray;
        outline: none;
        cursor: pointer;
    }
`

const SmallDivider = styled('hr')`
    border: none;
    height: 1px;
    background-color: gray;
    margin: 5px 0px;
`

export default function Aside(props: {
    whoIsOnline: string[]
    showReturnToPresent?: boolean
    onReturnToPresent?: () => void
}) {
    const onlineToDisplay = () => props.whoIsOnline.slice(undefined, MAX_ONLINE_VISIBLE);
    const andMoreCount = () => props.whoIsOnline.length - onlineToDisplay().length;

    const navigate = useNavigate();

    return (
        <Body>
            <u>users online</u>
            <For each={onlineToDisplay()}>
                {user => (
                    <>
                        <p>{user}</p>
                    </>
                )}
            </For>
            <Show when={andMoreCount() > 0}>
                ...and {andMoreCount()} more
            </Show>
            <SmallDivider />
            <Show when={props.showReturnToPresent}>
                <button onClick={props.onReturnToPresent}>[ PRESENT ]</button>
            </Show>
            <button onClick={() => navigate("/")}>[ RETURN ]</button>
        </Body>
    )
}

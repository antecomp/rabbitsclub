import { useNavigate } from "@solidjs/router";
import { For, Show } from "solid-js";
import { styled } from "solid-styled-components";

const MAX_ONLINE_VISIBLE = 10;

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

/** Chat sidebar with online user presence, return-to-present control, and exit navigation. */
export default function Aside(props: {
    whoIsOnline: string[]
    showReturnToPresent?: boolean
    onReturnToPresent?: () => void
}) {
    const onlineToDisplay = () => props.whoIsOnline.slice(0, MAX_ONLINE_VISIBLE);
    const onlineHidden = () => props.whoIsOnline.slice(MAX_ONLINE_VISIBLE);
    const andMoreCount = () => onlineHidden().length;

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
                <p title={onlineHidden().join(',')}>...and {andMoreCount()} more</p>
            </Show>
            <SmallDivider />
            <Show when={props.showReturnToPresent}>
                <button onClick={props.onReturnToPresent}>[ PRESENT ]</button>
            </Show>
            <button onClick={() => navigate("/")}>[ EXIT ]</button>
        </Body>
    )
}

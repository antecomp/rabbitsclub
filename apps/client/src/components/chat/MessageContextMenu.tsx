import { Component, createSignal, For, Show } from "solid-js";
import { MessageContextMenu, MessageExpandedMenu } from "./Message.styles";
import { MessageProps, Side } from "./Message";
import { permissions } from "@/api/permissions";
import { MAX_MESSAGE_LENGTH } from "#config";
import { api } from "@/api/backend";
import { Dynamic } from "solid-js/web";

type MessageMenuProps = MessageProps & { side: Side }

type MenuItem = {
    name: string,
    condition: (props: MessageMenuProps) => boolean
    component: Component<MessageMenuProps & { closeSelf: () => void }>
}

const MENUS = {
    mod: {
        name: "MOD",
        condition: () => {
            const perms = permissions()
            return Boolean(perms?.can_leave_notes || perms?.can_delete_messages)
        },
        component: (props) => {
            const [reason, setReason] = createSignal("");
            return <MessageExpandedMenu>
                &gt; message moderation...
                <br />
                <input type="text" value={reason()} onInput={e => setReason(e.target.value)} maxlength={MAX_MESSAGE_LENGTH} /> <br />
                <button onClick={() => api.moderation.messages({ id: props.id }).delete({ reason: reason() })}>[ DELETE MESSAGE ]</button>
            </MessageExpandedMenu>
        }
    },
    test: {
        name: "TEST",
        condition: (props) => !props.is_deleted,
        component: () => <MessageExpandedMenu>This is a test!</MessageExpandedMenu>
    },
    delete: {
        name: "DEL",
        condition: props => props.isOwn,
        component: (props) => {
            // pull this into higher scope to prevent func closure copy for every message
            const del = () => { api.messages({ id: props.id }).delete(); props.closeSelf() }
            return <MessageExpandedMenu>
                &gt; confirm delete...
                <button onClick={del}>[ DELETE ]</button>
                <button onClick={props.closeSelf}>[ NEVERMIND ]</button>
            </MessageExpandedMenu>
        }
    }
} as const satisfies Record<string, MenuItem>

type MenuChoice = keyof typeof MENUS

export default function createMessageContextMenu(props: MessageMenuProps) {
    const [currentlyOpenedMenu, setOpenMenu] = createSignal<MenuChoice | null>(null);

    const ContextMenu = () => (
        <MessageContextMenu side={props.side}>
            <For each={
                Object.entries(MENUS).filter(([, { condition }]) => condition(props)) as [MenuChoice, typeof MENUS[MenuChoice]][]
            }>
                {([optionKey, option]) =>
                    // todo change to styled comp?
                    <><a onClick={() => setOpenMenu(prev =>
                        // either close or change the menu
                        prev === optionKey ? null : optionKey
                    )}>
                        [ {option.name} ]
                    </a><br /></>
                }
            </For>
        </MessageContextMenu>
    );

    const ExpandedMenu = () => (
        <Show when={currentlyOpenedMenu()}>
            <Dynamic
                component={MENUS[currentlyOpenedMenu()!].component}
                {...props}
                closeSelf={() => setOpenMenu(null)}
            />
        </Show>
    )

    return { ContextMenu, ExpandedMenu }
}
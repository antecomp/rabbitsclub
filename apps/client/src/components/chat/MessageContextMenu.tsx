import { Component, createSignal, For } from "solid-js";
import { MessageContextMenu, MessageExpandedMenu } from "./Message.styles";
import { MessageProps, Side } from "./Message";
import { permissions } from "@/api/permissions";
import { MAX_MESSAGE_LENGTH } from "#config";
import { api } from "@/api/backend";

type MessageMenuProps = MessageProps & { side: Side }

type MenuChoice = keyof typeof MENUS;

// TODO COLLAPSE MENUS, MENU NAME, AND CONDITION INTO SINGLE SHARED CONSTANT!!!
const MENUS = {
    test() {
        return <MessageExpandedMenu>
            This is an example!
        </MessageExpandedMenu>
    },
    mod(props) {
        const [reason, setReason] = createSignal("");
        return <MessageExpandedMenu>
            &gt; message moderation...
            <br />
            <input type="text" value={reason()} onInput={e => setReason(e.target.value)} maxlength={MAX_MESSAGE_LENGTH} /> <br />
            <button onClick={() => api.moderation.messages({ id: props.id }).delete({ reason: reason() })}>[ DELETE MESSAGE ]</button>
        </MessageExpandedMenu>
    }
} as const satisfies Record<string, Component<MessageMenuProps>>;

const menuConditions = {
    test: (props) => !props.is_deleted,
    mod: () => {
        const perms = permissions();
        if (!perms) return false;
        return perms.can_leave_notes || perms.can_delete_messages
    }
} as const satisfies Record<MenuChoice, (props: MessageMenuProps) => boolean>

export default function createMessageContextMenu(props: MessageMenuProps) {
    const [currentlyOpenedMenu, setOpenMenu] = createSignal<MenuChoice | null>(null);

    const ContextMenu = () => (
        <MessageContextMenu side={props.side}>
            <For each={
                (Object.keys(MENUS) as MenuChoice[]).filter(key => menuConditions[key](props))
            }>
                {option =>
                    // todo change to styled comp?
                    <><a onClick={() => setOpenMenu(prev =>
                        // either close or change the menu
                        prev === option ? null : option
                    )}>
                        [ {option.toUpperCase()} ]
                    </a><br/></>
                }
            </For>
        </MessageContextMenu>
    );

    const ExpandedMenu = (props: MessageMenuProps) => {
        const currentMenu = currentlyOpenedMenu();
        if (!currentMenu) return;
        return MENUS[currentMenu](props)
    }

    return { ContextMenu, ExpandedMenu }
}
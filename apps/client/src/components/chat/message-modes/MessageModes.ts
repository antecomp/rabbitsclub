import { Component } from "solid-js";
import { MessageProps } from "../Message";
import EditMessage from "./EditMessage";
import { permissions } from "@/api/permissions";

export type MessageActionComponent = Component<MessageProps & {closeSelf: () => void}>

export const ACTIONS = {
    edit: {
        name: "EDT",
        condition: p => p.isOwn && !p.is_deleted,
        component: EditMessage
    },
    delete: {
        name: "DLT",
        condition: p => p.isOwn && !p.is_deleted,
        component: EditMessage
    },
    mod: {
        name: 'MOD',
        condition() {
            const perms = permissions();
            return Boolean(perms?.can_leave_notes || perms?.can_delete_messages)
        },
        component: EditMessage
    }
} as const satisfies Record<string, {
    name: string;
    condition: (props: MessageProps) => boolean;
    component: MessageActionComponent
}>;

export type MessageAction = keyof typeof ACTIONS;
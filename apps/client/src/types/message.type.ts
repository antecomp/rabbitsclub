import { api } from "../api/backend"
import type { WSMessageType } from "~/schemas/messages.schema";

export type MessageHistoryData = Exclude<Awaited<ReturnType<typeof api.messages.get>>['data'],null>;

export type UserChatMessage = {
    type: "user";
    message: MessageHistoryData[number] | Extract<WSMessageType, { type: "user" }>;
};

export type SystemChatMessage = {
    type: "system";
    message: Extract<WSMessageType, { type: "system" }>;
};

export type ChatMessage = UserChatMessage | SystemChatMessage;

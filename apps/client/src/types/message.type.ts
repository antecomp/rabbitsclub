import type { WSMessageType } from "~/schemas/messages.schema";

export type ChatMessage = Exclude<WSMessageType, { type: "online" }>;
export type UserChatMessage = Extract<ChatMessage, { type: "user" }>;
export type SystemChatMessage = Extract<ChatMessage, { type: "system" }>;
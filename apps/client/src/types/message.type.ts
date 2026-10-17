import type { WSMessageType } from '~/schemas/messages.schema';

export type DisplayedMessage = Exclude<WSMessageType, { type: 'online' }>;
export type UserChatMessage = Extract<WSMessageType, { type: 'user' }>;
export type SystemChatMessage = Extract<WSMessageType, { type: 'system' }>;
import { BE } from "../api"

export type MessageHistoryData = Exclude<Awaited<ReturnType<typeof BE.messages.get>>['data'], null>;

type MessageWSEvent = Parameters<Parameters<ReturnType<typeof BE.ws.subscribe>['subscribe']>[0]>[0];

export type MessageWSData = MessageWSEvent['data'];

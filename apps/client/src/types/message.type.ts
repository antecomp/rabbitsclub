import { BE } from "../api"

export type MessageHistoryData = Exclude<Awaited<ReturnType<typeof BE.messages.get>>['data'], null>;
import { api } from "../api/backend"

export type MessageHistoryData = Exclude<Awaited<ReturnType<typeof api.messages.get>>['data'],null>;
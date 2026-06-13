import { t } from 'elysia'

export interface Message {
    id: number
    username: string
    content: string
    created_at: string
}

export const MessageSchema = t.Object({
    id: t.Number(),
    username: t.String(),
    content: t.String(),
    created_at: t.String()
})
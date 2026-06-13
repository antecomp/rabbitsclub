import { t } from 'elysia'

export const SentMessageSchema = t.Object({
    username: t.String(),
    content: t.String()
});

export const MessageSchema = t.Object({
    id: t.Number(),
    username: t.String(),
    content: t.String(),
    created_at: t.String()
})
export type Message = typeof MessageSchema['static'];
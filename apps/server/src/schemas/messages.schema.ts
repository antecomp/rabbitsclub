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

export const WSBroadcastMessageSchema = t.Object({
    type: t.Literal("system"),
    content: t.String()
});

export const WSBroadcastOnlineSchema = t.Object({
    type: t.Literal("online"),
    // Might change this to ids or something else in the future 
    // when we want to get proper display info
    users: t.Array(t.String())
})

export const WSMessageSchema = t.Union([
    WSBroadcastMessageSchema,
    WSBroadcastOnlineSchema,
    t.Intersect([
        MessageSchema, 
        t.Object({ type: t.Literal("user") })
    ])
]);
export type WSMessageType = typeof WSMessageSchema['static'];
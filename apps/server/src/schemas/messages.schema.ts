import { t } from "elysia"
import { model } from "../db/model"
import { MAX_MESSAGE_LENGTH } from "#config"

/**
 * Runtime schema for a persisted chat message backed by the messages table.
 * Extracted type: Message
 */
export const MessageSchema = t.Object(model.select.messages)
export type Message = typeof MessageSchema['static']

/** Client-to-server schema for a newly sent message body. */
export const SentMessageSchema = t.Object({ content: t.String({maxLength: MAX_MESSAGE_LENGTH}) })

export enum SystemEvents {
    USER_JOINED = "user_joined",
    USER_LEFT = "user_left"
}

/** WebSocket broadcast payload for system events such as join/leave notifications. */
export const WSBroadcastMessageSchema = t.Object({
    type: t.Literal("system"),
    event: t.Union([
        t.Literal(SystemEvents.USER_JOINED),
        t.Literal(SystemEvents.USER_LEFT)
    ]),
    content: t.Optional(t.String())
});

/** WebSocket broadcast payload listing currently online users. */
export const WSBroadcastOnlineSchema = t.Object({
    type: t.Literal("online"),
    users: t.Array(t.String())
})

/**
 * Union schema for all supported WebSocket message payloads.
 * Extracted type: WSMessageType
 */
export const WSMessageSchema = t.Union([
    WSBroadcastMessageSchema,
    WSBroadcastOnlineSchema,
    t.Intersect([
        MessageSchema, 
        t.Object({ type: t.Literal("user") })
    ])
]);
export type WSMessageType = typeof WSMessageSchema['static'];

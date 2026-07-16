import { t } from "elysia"
import { model } from "../db/model"
import { MAX_MESSAGE_LENGTH } from "#config"
import { actions } from "~/db/actions"

/**
 * Runtime schema for a persisted chat message backed by the messages table.
 * Extracted type: Message
 */
export const DbMessageSchema = t.Object(model.select.messages)
export type DbMessage = typeof DbMessageSchema['static']

/** Client-to-server schema for a newly sent message body. */
export const SentMessageSchema = t.Object({ content: t.String({maxLength: MAX_MESSAGE_LENGTH}) })

/** Message form as sent to the client */
export const ClientMessageSchema = t.Object({
    type: t.Literal('user'),
    id: t.Number(),
    username: t.String(),
    content: t.String(),
    is_deleted: t.Boolean(),
    deleted_reason: t.Union([t.String(), t.Null()]),
    created_at: t.String()
});
export type ClientMessage = typeof ClientMessageSchema['static'];

/** Extract/Parse Relevant Message Database Fields Into Public-Facing Message Schema */
export function toClientMessage(message: DbMessage): ClientMessage {
    const is_deleted = message.deleted_at !== null;

    const sender = actions.getUserById(message.user_id);
    const username = sender?.username ?? "ERR";

    return {
        type: 'user',
        id: message.id,
        username,
        content: is_deleted ? "" : message.content,
        is_deleted,
        deleted_reason: is_deleted ? message.deleted_reason : null,
        created_at: message.created_at
    }
}

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
    ClientMessageSchema
]);
export type WSMessageType = typeof WSMessageSchema['static'];

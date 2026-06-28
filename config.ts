/** @fileoverview
 * Shared *public* constants. Things that are not env-specific.
 */

/** Page size for requesting chunks of messages (initial load + load more calls) */
export const MESSAGE_PAGE_SIZE = 50;

/** Required Password Length */
export const MIN_PASSWORD_LENGTH = 6;

/** Maximum Password Length */
export const MAX_PASSWORD_LENGTH = 128;

/** Required Username Length */
export const MIN_USERNAME_LENGTH = 2;

/** Maximum Username Length */
export const MAX_USERNAME_LENGTH = 32;

/** Maximum Length (chars) of a chat message */
export const MAX_MESSAGE_LENGTH = 250;

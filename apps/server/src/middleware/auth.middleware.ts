import type { Cookie } from "elysia"
import type { JWTPayload } from "../schemas/users.schema"

export async function verifyAuth(jwtInstance: any, cookieValue: Cookie<string | undefined>): Promise<JWTPayload | null> {
    if (!cookieValue) return null
    const payload = await jwtInstance.verify(cookieValue.value) as JWTPayload | false
    return payload || null
}
import { AvatarDataSchema, type AvatarData } from '~/schemas/profiles.schema';
import { Value } from '@sinclair/typebox/value';

export default function parseAvatarData(value: string | null): AvatarData | null {
    if (!value) return null;

    try {
        const parsed: unknown = JSON.parse(value);
        return Value.Check(AvatarDataSchema, parsed) ? parsed : null;
    } catch {
        return null;
    }
}

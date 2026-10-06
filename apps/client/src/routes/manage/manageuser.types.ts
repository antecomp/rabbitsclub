import type { AvatarData } from '@/avatar/avatar.types';
import type { ModerationSummary } from './moderationSummary';

export interface ManageUserPresentationModel {
    id: number;
    username: string;
    avatar: AvatarData;
    moderation: ModerationSummary;
}

export interface ModerationActionProps {
    label: string;
    onSubmit: (reason: string) => Promise<boolean>;
}

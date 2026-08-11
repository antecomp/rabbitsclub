import messagesActions from './messages.actions';
import moderationActions from './moderation.actions';
import userActions from './user.actions';
import invitesActions from './invites.actions';
import profileActions from './profile.actions';
import authActions from './auth.actions';

export const actions = {
    messages:       messagesActions,
    moderation:     moderationActions,
    users:           userActions,
    invites:        invitesActions,
    profiles:       profileActions,
    auth:           authActions
};
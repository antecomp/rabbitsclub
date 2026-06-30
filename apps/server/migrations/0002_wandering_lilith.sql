CREATE TABLE `user_permissions` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`can_ban_users` integer DEFAULT 0 NOT NULL,
	`can_delete_messages` integer DEFAULT 0 NOT NULL,
	`can_edit_messages` integer DEFAULT 0 NOT NULL,
	`can_manage_invites` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

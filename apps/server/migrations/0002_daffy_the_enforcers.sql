PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_permissions` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`can_ban_users` integer DEFAULT false NOT NULL,
	`can_delete_messages` integer DEFAULT false NOT NULL,
	`can_leave_notes` integer DEFAULT false NOT NULL,
	`can_manage_invites` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_permissions`("user_id", "can_ban_users", "can_delete_messages", "can_leave_notes", "can_manage_invites") SELECT "user_id", "can_ban_users", "can_delete_messages", "can_leave_notes", "can_manage_invites" FROM `user_permissions`;--> statement-breakpoint
DROP TABLE `user_permissions`;--> statement-breakpoint
ALTER TABLE `__new_user_permissions` RENAME TO `user_permissions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
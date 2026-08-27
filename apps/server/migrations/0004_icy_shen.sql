PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`token_version` integer DEFAULT 0 NOT NULL,
	`is_banned` integer DEFAULT false NOT NULL,
	`banned_reason` text,
	`banned_at` text,
	`banned_by` integer,
	`unbanned_by` integer,
	`unbanned_at` text,
	`unbanned_reason` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`banned_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unbanned_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "password", "is_admin", "token_version", "is_banned", "banned_reason", "banned_at", "banned_by", "unbanned_by", "unbanned_at", "unbanned_reason", "created_at") SELECT "id", "username", "password", "is_admin", "token_version", "is_banned", "banned_reason", "banned_at", "banned_by", "unbanned_by", "unbanned_at", "unbanned_reason", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
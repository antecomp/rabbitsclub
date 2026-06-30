ALTER TABLE `messages` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `deleted_by` integer REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `messages` ADD `deleted_reason` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `admin_note` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `admin_note_by` integer REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `messages` ADD `admin_note_at` text;--> statement-breakpoint
ALTER TABLE `user_permissions` ADD `can_leave_notes` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_permissions` DROP COLUMN `can_edit_messages`;--> statement-breakpoint
ALTER TABLE `users` ADD `is_banned` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `banned_reason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `banned_at` text;--> statement-breakpoint
ALTER TABLE `users` ADD `banned_by` integer REFERENCES users(id);
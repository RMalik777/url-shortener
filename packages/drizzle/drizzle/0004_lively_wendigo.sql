ALTER TABLE `urls` ADD `is_deleted` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `urls` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `urls_isDeleted_idx` ON `urls` (`is_deleted`);--> statement-breakpoint
ALTER TABLE `urls` DROP COLUMN `clicked`;
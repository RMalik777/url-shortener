PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_urls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url_full` text NOT NULL,
	`url_short` text NOT NULL,
	`clicked` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`created_by` text NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_urls`("id", "url_full", "url_short", "clicked", "created_at", "updated_at", "created_by") SELECT "id", "url_full", "url_short", "clicked", "created_at", "updated_at", "created_by" FROM `urls`;--> statement-breakpoint
DROP TABLE `urls`;--> statement-breakpoint
ALTER TABLE `__new_urls` RENAME TO `urls`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `urls_url_short_unique` ON `urls` (`url_short`);--> statement-breakpoint
CREATE INDEX `urls_createdBy_idx` ON `urls` (`created_by`);
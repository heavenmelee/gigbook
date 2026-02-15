CREATE TABLE `packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`musicianId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`eventType` varchar(100),
	`duration` int NOT NULL,
	`sets` int DEFAULT 1,
	`breakTime` int DEFAULT 0,
	`basePrice` decimal(10,2) NOT NULL,
	`inclusions` json,
	`addOns` json,
	`rules` json,
	`isPopular` boolean DEFAULT false,
	`isBestValue` boolean DEFAULT false,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `realName` varchar(255);--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `languages` json;--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `travelRadius` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `travelFee` decimal(10,2);--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `socialLinks` json;--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `lineupType` varchar(50);--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `members` json;--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `skills` json;--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `setlist` json;--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `ownSoundSystem` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `equipment` json;--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `venueRequirements` json;--> statement-breakpoint
ALTER TABLE `musician_profiles` ADD `techRider` text;
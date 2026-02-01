CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`musicianId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`startTime` varchar(5),
	`endTime` varchar(5),
	`isAvailable` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`musicianId` int NOT NULL,
	`listingId` int NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`eventTime` varchar(5) NOT NULL,
	`eventEndTime` varchar(5),
	`venueName` varchar(255),
	`venueAddress` text,
	`specialRequests` text,
	`totalAmount` decimal(10,2) NOT NULL,
	`status` enum('pending_approval','approved','confirmed','rejected','cancelled_user','cancelled_musician','completed','disputed') NOT NULL DEFAULT 'pending_approval',
	`cancelledAt` timestamp,
	`cancelledBy` enum('user','musician','admin'),
	`cancellationReason` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`musicianId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`price` decimal(10,2) NOT NULL,
	`priceType` enum('per_hour','per_event','per_day') NOT NULL DEFAULT 'per_event',
	`duration` int,
	`photos` json,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `musician_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stageName` varchar(255),
	`bio` text,
	`genre` varchar(100),
	`location` varchar(255),
	`experienceYears` int DEFAULT 0,
	`coverPhoto` text,
	`portfolio` json,
	`rating` decimal(3,2) DEFAULT '0.00',
	`totalReviews` int DEFAULT 0,
	`totalGigs` int DEFAULT 0,
	`strikes` int DEFAULT 0,
	`verified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `musician_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `musician_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`userId` int NOT NULL,
	`musicianId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`commission` decimal(10,2) NOT NULL,
	`musicianPayout` decimal(10,2) NOT NULL,
	`status` enum('pending','escrow','released','refunded','partial_refund','failed') NOT NULL DEFAULT 'pending',
	`penaltyAmount` decimal(10,2) DEFAULT '0.00',
	`penaltyReason` text,
	`refundAmount` decimal(10,2) DEFAULT '0.00',
	`paymentMethod` varchar(50),
	`transactionId` varchar(255),
	`escrowAt` timestamp,
	`releasedAt` timestamp,
	`refundedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`userId` int NOT NULL,
	`musicianId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviews_bookingId_unique` UNIQUE(`bookingId`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`phone` varchar(20),
	`loginMethod` varchar(64),
	`role` enum('user','musician','admin') NOT NULL DEFAULT 'user',
	`status` enum('pending','approved','suspended') NOT NULL DEFAULT 'pending',
	`profilePhoto` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

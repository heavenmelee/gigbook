CREATE TABLE `musician_verification_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`musicianId` int NOT NULL,
	`documentType` enum('id','portfolio','certificate') NOT NULL,
	`documentUrl` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`rejectionReason` text,
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `musician_verification_documents_id` PRIMARY KEY(`id`)
);

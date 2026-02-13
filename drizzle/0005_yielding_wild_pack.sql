CREATE TABLE `musician_bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`musicianId` int NOT NULL,
	`bankCode` varchar(50) NOT NULL,
	`bankAccountNumber` varchar(50) NOT NULL,
	`bankAccountHolder` varchar(255) NOT NULL,
	`isVerified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `musician_bank_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `musician_bank_accounts_musicianId_unique` UNIQUE(`musicianId`)
);
--> statement-breakpoint
CREATE TABLE `xendit_invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`xenditInvoiceId` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`commissionAmount` decimal(12,2) NOT NULL,
	`musicianPayoutAmount` decimal(12,2) NOT NULL,
	`status` enum('PENDING','PAID','EXPIRED','FAILED') NOT NULL DEFAULT 'PENDING',
	`paymentMethod` varchar(50),
	`invoiceUrl` text,
	`paidAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `xendit_invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `xendit_invoices_xenditInvoiceId_unique` UNIQUE(`xenditInvoiceId`)
);
--> statement-breakpoint
CREATE TABLE `xendit_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`musicianId` int NOT NULL,
	`xenditPayoutId` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`status` enum('PENDING','PROCESSING','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING',
	`bankCode` varchar(50),
	`bankAccountNumber` varchar(50),
	`bankAccountHolder` varchar(255),
	`failureCode` varchar(100),
	`failureMessage` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `xendit_payouts_id` PRIMARY KEY(`id`),
	CONSTRAINT `xendit_payouts_xenditPayoutId_unique` UNIQUE(`xenditPayoutId`)
);

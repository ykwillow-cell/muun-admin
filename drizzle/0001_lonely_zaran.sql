CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `columns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`author` varchar(100) NOT NULL DEFAULT '무운 역술팀',
	`content` text NOT NULL,
	`metaTitle` varchar(255),
	`metaDescription` text,
	`canonicalUrl` varchar(255),
	`thumbnailUrl` varchar(255),
	`readingTime` int,
	`published` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `columns_id` PRIMARY KEY(`id`),
	CONSTRAINT `columns_slug_unique` UNIQUE(`slug`)
);

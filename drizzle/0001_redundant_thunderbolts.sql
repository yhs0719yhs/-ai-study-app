CREATE TABLE `learningGoals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`goalType` enum('daily','weekly','monthly') NOT NULL,
	`targetCount` int NOT NULL,
	`currentCount` int NOT NULL DEFAULT 0,
	`subject` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learningGoals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `problems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`imageUrl` varchar(500) NOT NULL,
	`problemType` varchar(100) NOT NULL,
	`subject` varchar(100) NOT NULL,
	`solution` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `problems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`totalProblems` int NOT NULL DEFAULT 0,
	`topProblemTypes` text,
	`recentTrend` text,
	`subjectDistribution` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `statistics_id` PRIMARY KEY(`id`)
);

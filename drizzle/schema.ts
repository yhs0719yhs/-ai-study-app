import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 문제 저장 테이블
export const problems = mysqlTable("problems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  problemType: varchar("problemType", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  solution: text("solution").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Problem = typeof problems.$inferSelect;
export type InsertProblem = typeof problems.$inferInsert;

// 학습 목표 테이블
export const learningGoals = mysqlTable("learningGoals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  goalType: mysqlEnum("goalType", ["daily", "weekly", "monthly"]).notNull(),
  targetCount: int("targetCount").notNull(),
  currentCount: int("currentCount").default(0).notNull(),
  subject: varchar("subject", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearningGoal = typeof learningGoals.$inferSelect;
export type InsertLearningGoal = typeof learningGoals.$inferInsert;

// 통계 데이터 테이블
export const statistics = mysqlTable("statistics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  totalProblems: int("totalProblems").default(0).notNull(),
  topProblemTypes: text("topProblemTypes"), // JSON 형식
  recentTrend: text("recentTrend"), // JSON 형식
  subjectDistribution: text("subjectDistribution"), // JSON 형식
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Statistic = typeof statistics.$inferSelect;
export type InsertStatistic = typeof statistics.$inferInsert;

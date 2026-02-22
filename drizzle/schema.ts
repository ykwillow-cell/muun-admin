import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

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

/**
 * 칼럼(Column) 테이블
 * 무운 사주의 칼럼 콘텐츠를 저장하는 테이블
 */
export const columns = mysqlTable("columns", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL 슬러그
  title: varchar("title", { length: 255 }).notNull(), // 칼럼 제목
  category: varchar("category", { length: 100 }).notNull(), // 카테고리
  author: varchar("author", { length: 100 }).default("무운 역술팀").notNull(), // 작성자
  content: text("content").notNull(), // 마크다운 형식의 콘텐츠
  metaTitle: varchar("metaTitle", { length: 255 }), // SEO 메타 제목
  metaDescription: text("metaDescription"), // SEO 메타 설명
  canonicalUrl: varchar("canonicalUrl", { length: 255 }), // 캐노니컬 URL
  thumbnailUrl: varchar("thumbnailUrl", { length: 255 }), // 썸네일 이미지 URL
  readingTime: int("readingTime"), // 읽기 시간 (분)
  published: boolean("published").default(false).notNull(), // 발행 여부
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Column = typeof columns.$inferSelect;
export type InsertColumn = typeof columns.$inferInsert;

/**
 * 카테고리 테이블
 * 칼럼 카테고리 관리
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

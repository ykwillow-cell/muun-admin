import { integer, pgEnum, pgTable, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

// PostgreSQL enum for role
export const roleEnum = pgEnum("role", ["user", "admin"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 칼럼(Column) 테이블
 * 무운 사주의 칼럼 콘텐츠를 저장하는 테이블
 */
export const columns = pgTable("columns", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL 슬러그
  title: varchar("title", { length: 255 }).notNull(), // 칼럼 제목
  category: varchar("category", { length: 100 }).notNull(), // 카테고리
  author: varchar("author", { length: 100 }).default("무운 역술팀").notNull(), // 작성자
  content: text("content").notNull(), // 마크다운 형식의 콘텐츠
  metaTitle: varchar("metaTitle", { length: 255 }), // SEO 메타 제목
  metaDescription: text("metaDescription"), // SEO 메타 설명
  canonicalUrl: varchar("canonicalUrl", { length: 255 }), // 캐노니컬 URL
  thumbnailUrl: varchar("thumbnailUrl", { length: 255 }), // 썸네일 이미지 URL
  readingTime: integer("readingTime"), // 읽기 시간 (분)
  published: boolean("published").default(false).notNull(), // 발행 여부
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Column = typeof columns.$inferSelect;
export type InsertColumn = typeof columns.$inferInsert;

/**
 * 카테고리 테이블
 * 칼럼 카테고리 관리
 */
export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Admin 테이블
 * 관리자 계정 정보 저장 (이메일/비밀번호 로그인용)
 */
export const admins = pgTable("admins", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(), // bcrypt로 해싱된 비밀번호
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;

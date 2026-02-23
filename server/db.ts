import { eq, and, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, columns, categories, Column, InsertColumn, Category, InsertCategory, admins, Admin, InsertAdmin } from "../drizzle/schema";
import { ENV } from './_core/env';
import bcrypt from "bcrypt";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== 칼럼 관련 쿼리 ====================

/**
 * 칼럼 목록 조회 (필터링, 페이지네이션)
 */
export async function getColumns(options: {
  category?: string;
  search?: string;
  published?: boolean;
  page?: number;
  limit?: number;
} = {}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get columns: database not available");
    return [];
  }

  const { category, search, published, page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (category) {
    conditions.push(eq(columns.category, category));
  }
  if (search) {
    conditions.push(like(columns.title, `%${search}%`));
  }
  if (published !== undefined) {
    conditions.push(eq(columns.published, published));
  }

  const query = db
    .select()
    .from(columns)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(columns.createdAt))
    .limit(limit)
    .offset(offset);

  return await query;
}

/**
 * 칼럼 개수 조회
 */
export async function getColumnsCount(options: {
  category?: string;
  search?: string;
  published?: boolean;
} = {}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get columns count: database not available");
    return 0;
  }

  const { category, search, published } = options;
  const conditions = [];
  if (category) {
    conditions.push(eq(columns.category, category));
  }
  if (search) {
    conditions.push(like(columns.title, `%${search}%`));
  }
  if (published !== undefined) {
    conditions.push(eq(columns.published, published));
  }

  const result = await db
    .select({ count: columns.id })
    .from(columns)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return result[0]?.count || 0;
}

/**
 * 칼럼 상세 조회
 */
export async function getColumnById(id: number): Promise<Column | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get column: database not available");
    return undefined;
  }

  const result = await db.select().from(columns).where(eq(columns.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * 칼럼 슬러그로 조회
 */
export async function getColumnBySlug(slug: string): Promise<Column | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get column: database not available");
    return undefined;
  }

  const result = await db.select().from(columns).where(eq(columns.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * 칼럼 생성
 */
export async function createColumn(data: InsertColumn): Promise<Column | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create column: database not available");
    return null;
  }

  try {
    const result = await db.insert(columns).values(data);
    const id = (result as any).insertId;
    const column = await getColumnById(id);
    return column || null;
  } catch (error) {
    console.error("[Database] Failed to create column:", error);
    throw error;
  }
}

/**
 * 칼럼 수정
 */
export async function updateColumn(
  id: number,
  data: Partial<InsertColumn>
): Promise<Column | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update column: database not available");
    return null;
  }

  try {
    await db.update(columns).set(data).where(eq(columns.id, id));
    const column = await getColumnById(id);
    return column || null;
  } catch (error) {
    console.error("[Database] Failed to update column:", error);
    throw error;
  }
}

/**
 * 칼럼 삭제
 */
export async function deleteColumn(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete column: database not available");
    return false;
  }

  try {
    await db.delete(columns).where(eq(columns.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete column:", error);
    throw error;
  }
}

// ==================== 카테고리 관련 쿼리 ====================

/**
 * 모든 카테고리 조회
 */
export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get categories: database not available");
    return [];
  }

  return await db.select().from(categories);
}

/**
 * 카테고리 생성
 */
export async function createCategory(data: InsertCategory): Promise<Category | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create category: database not available");
    return null;
  }

  try {
    await db.insert(categories).values(data);
    const result = await db.select().from(categories).where(eq(categories.slug, data.slug)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create category:", error);
    throw error;
  }
}

// ==================== 관리자 관련 쿼리 ====================

/**
 * 이메일로 관리자 조회
 */
export async function getAdminByEmail(email: string): Promise<Admin | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get admin: database not available");
    return undefined;
  }

  const result = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * ID로 관리자 조회
 */
export async function getAdminById(id: number): Promise<Admin | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get admin: database not available");
    return undefined;
  }

  const result = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * 관리자 생성
 */
export async function createAdmin(data: {
  email: string;
  password: string;
  name: string;
}): Promise<Admin | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create admin: database not available");
    return null;
  }

  try {
    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await db.insert(admins).values({
      email: data.email,
      passwordHash,
      name: data.name,
      isActive: true,
    });

    // insertId 추출
    let id: number | undefined;
    if (result && typeof result === 'object') {
      id = (result as any).insertId || (result as any)[0]?.insertId;
    }
    
    if (!id) {
      // insertId가 없으면 이메일로 조회
      const admin = await getAdminByEmail(data.email);
      return admin || null;
    }
    
    const admin = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
    return admin.length > 0 ? admin[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create admin:", error);
    throw error;
  }
}

/**
 * 비밀번호 검증
 */
export async function verifyAdminPassword(email: string, password: string): Promise<Admin | null> {
  const admin = await getAdminByEmail(email);
  if (!admin) {
    return null;
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return null;
  }

  return admin;
}

/**
 * 관리자 마지막 로그인 시간 업데이트
 */
export async function updateAdminLastSignedIn(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update admin: database not available");
    return;
  }

  try {
    await db.update(admins).set({ lastSignedIn: new Date() }).where(eq(admins.id, id));
  } catch (error) {
    console.error("[Database] Failed to update admin last signed in:", error);
    throw error;
  }
}

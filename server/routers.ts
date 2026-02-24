import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import {
  getColumns,
  getColumnsCount,
  getColumnById,
  getColumnBySlug,
  createColumn,
  updateColumn,
  deleteColumn,
  getCategories,
  createCategory,
  getAdminByEmail,
  createAdmin,
  verifyAdminPassword,
  updateAdminLastSignedIn,
} from "./db";
import { TRPCError } from "@trpc/server";

// 칼럼 유효성 검사 스키마
const columnSchema = z.object({
  slug: z
    .string()
    .min(1, "슬러그는 필수입니다")
    .regex(/^[a-z0-9-]+$/, "슬러그는 소문자, 숫자, 하이픈만 포함할 수 있습니다"),
  title: z.string().min(1, "제목은 필수입니다").max(255),
  category: z.string().min(1, "카테고리는 필수입니다").or(z.number().transform(n => n.toString())),
  author: z.string().default("무운 역술팀"),
  content: z.string().min(1, "내용은 필수입니다"),
  metaTitle: z.string().max(60).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  readingTime: z.number().int().positive().optional(),
  published: z.boolean().default(false),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    /**
     * 이메일/비밀번호 로그인
     */
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("유효한 이메일을 입력하세요"),
          password: z.string().min(1, "비밀번호는 필수입니다"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // 관리자 인증
        const admin = await verifyAdminPassword(input.email, input.password);
        if (!admin) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "이메일 또는 비밀번호가 올바르지 않습니다.",
          });
        }

        if (!admin.isActive) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "비활성화된 계정입니다.",
          });
        }

        // 마지막 로그인 시간 업데이트
        await updateAdminLastSignedIn(admin.id);

        // 세션 쿠키 설정
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, JSON.stringify({
          adminId: admin.id,
          email: admin.email,
          name: admin.name,
          role: "admin",
        }), cookieOptions);

        return {
          success: true,
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
          },
        };
      }),
  }),

  // ==================== 칼럼 관련 프로시저 ====================
    columns: router({
    /**
     * 칼럼 목록 조회 (검색, 필터링, 페이지네이션)
     */
    list: protectedProcedure
      .input(
        z.object({
          category: z.string().optional(),
          search: z.string().optional(),
          published: z.boolean().optional(),
          page: z.number().default(1),
          limit: z.number().default(20),
        })
      )
      .query(async ({ input, ctx }) => {
        // 관리자 권한 확인
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "관리자만 접근할 수 있습니다.",
          });
        }

        const items = await getColumns({
          category: input.category,
          search: input.search,
          published: input.published,
          page: input.page,
          limit: input.limit,
        });

        const total = await getColumnsCount({
          category: input.category,
          search: input.search,
          published: input.published,
        });

        return {
          items,
          total,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil(total / input.limit),
        };
      }),

    /**
     * 칼럼 상세 조회
     */
    get: protectedProcedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "관리자만 접근할 수 있습니다.",
          });
        }

        const column = await getColumnById(input);
        if (!column) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "칼럼을 찾을 수 없습니다.",
          });
        }

        return column;
      }),

    /**
     * 칼럼 생성
     */
    create: protectedProcedure
      .input(columnSchema)
      .mutation(async ({ input, ctx }) => {
        // 관리자 권한 확인
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "관리자만 접근할 수 있습니다.",
          });
        }

        // 슬러그 중복 확인
        const existing = await getColumnBySlug(input.slug);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "이미 존재하는 슬러그입니다.",
          });
        }

        const column = await createColumn({
          slug: input.slug,
          title: input.title,
          category: input.category,
          author: input.author,
          content: input.content,
          metaTitle: input.metaTitle,
          metaDescription: input.metaDescription,
          canonicalUrl: input.canonicalUrl || null,
          thumbnailUrl: input.thumbnailUrl || null,
          readingTime: input.readingTime || null,
          published: input.published,
        });

        if (!column) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "칼럼 생성에 실패했습니다.",
          });
        }

        // TODO: SSG 빌드 트리거
        // await triggerSSGBuild(column.id);

        return column;
      }),

    /**
     * 칼럼 수정
     */
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: columnSchema.partial(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // 관리자 권한 확인
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "관리자만 접근할 수 있습니다.",
          });
        }

        const existing = await getColumnById(input.id);
        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "칼럼을 찾을 수 없습니다.",
          });
        }

        // 슬러그 변경 시 중복 확인
        if (input.data.slug && input.data.slug !== existing.slug) {
          const slugExists = await getColumnBySlug(input.data.slug);
          if (slugExists) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "이미 존재하는 슬러그입니다.",
            });
          }
        }

        const column = await updateColumn(input.id, input.data);

        if (!column) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "칼럼 수정에 실패했습니다.",
          });
        }

        // TODO: SSG 빌드 트리거
        // await triggerSSGBuild(column.id);

        return column;
      }),

    /**
     * 칼럼 삭제
     */
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        // 관리자 권한 확인
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "관리자만 접근할 수 있습니다.",
          });
        }

        const existing = await getColumnById(input);
        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "칼럼을 찾을 수 없습니다.",
          });
        }

        const success = await deleteColumn(input);

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "칼럼 삭제에 실패했습니다.",
          });
        }

        // TODO: SSG 빌드 트리거
        // await triggerSSGBuild(input);

        return { success: true };
      }),

    /**
     * 공개 칼럼 목록 조회 (발행된 칼럼만, 인증 불필요)
     */
    publicList: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          limit: z.number().default(100),
        })
      )
      .query(async ({ input }) => {
        const items = await getColumns({
          category: input.category,
          published: true,
          limit: input.limit,
        });

        return items;
      }),

    /**
     * 공개 칼럼 상세 조회 (발행된 칼럼만, 슬러그로 조회)
     */
    publicGetBySlug: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const column = await getColumnBySlug(input);
        if (!column || !column.published) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "칼럼을 찾을 수 없습니다.",
          });
        }

        return column;
      }),
  }),

  // ==================== 카테고리 관련 프로시저 ====================
  categories: router({
    /**
     * 모든 카테고리 조회 (공개 - 로그인 불필요)
     */
    list: publicProcedure.query(async () => {
      return await getCategories();
    }),

    /**
     * 카테고리 생성 (관리자만)
     */
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "카테고리명은 필수입니다"),
          slug: z.string().min(1, "슬러그는 필수입니다"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "관리자만 접근할 수 있습니다.",
          });
        }

        return await createCategory({ name: input.name, slug: input.slug });
      }),
  }),
});

export type AppRouter = typeof appRouter;

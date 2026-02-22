# 무운(MUUN) 사주 칼럼 어드민 시스템 - 구현 가이드

## 개요

본 문서는 무운 사주 칼럼 어드민 시스템의 초기 구현 결과와 향후 개발 방향을 설명합니다. 13년 차 제품 디자이너의 감각을 반영하여 **마크다운 기호가 절대 노출되지 않는 깔끔한 WYSIWYG 에디터**와 **SEO 메타데이터 관리 기능**을 중심으로 설계되었습니다.

---

## 1. 구현 현황

### 1.1 완료된 작업

#### 데이터베이스 스키마
- **columns 테이블:** 칼럼 콘텐츠, 메타데이터, 발행 상태 관리
- **categories 테이블:** 칼럼 카테고리 관리
- **users 테이블:** 기존 인증 시스템과 통합 (Manus OAuth)

#### 백엔드 API (tRPC)
- **columns.list:** 칼럼 목록 조회 (필터링, 페이지네이션)
- **columns.get:** 칼럼 상세 조회
- **columns.create:** 칼럼 생성
- **columns.update:** 칼럼 수정
- **columns.delete:** 칼럼 삭제
- **categories.list:** 카테고리 목록 조회
- **categories.create:** 카테고리 생성

모든 프로시저는 `protectedProcedure`로 구현되어 관리자 권한 검증이 포함됩니다.

#### 프론트엔드 컴포넌트
- **RichTextEditor:** TipTap 기반 WYSIWYG 에디터 (마크다운 기호 미노출)
- **MetadataForm:** SEO 메타데이터 입력 폼 (Meta Title, Description, Canonical URL)
- **ColumnForm:** 칼럼 작성/편집 폼 (기본 정보 + 콘텐츠 + 메타데이터)

### 1.2 기술 스택

| 계층 | 기술 |
|------|------|
| **프론트엔드** | React 19 + Tailwind CSS 4 + shadcn/ui |
| **에디터** | TipTap 3 (ProseMirror 기반) |
| **백엔드** | Express 4 + tRPC 11 |
| **데이터베이스** | MySQL/TiDB + Drizzle ORM |
| **인증** | Manus OAuth |
| **폼 관리** | React Hook Form + Zod |

---

## 2. 핵심 기능 설명

### 2.1 WYSIWYG 에디터 (RichTextEditor)

**특징:**
- 마크다운 기호(`**`, `##` 등)가 절대 노출되지 않음
- 노션(Notion)이나 워드 프로세서처럼 직관적인 UI
- 텍스트 선택 후 스타일 적용 가능

**지원 기능:**
- 제목 (H2, H3)
- 텍스트 스타일 (굵게, 기울임, 코드)
- 리스트 (순서 있음/없음)
- 인용구 (blockquote)
- 구분선 (horizontal rule)
- 이미지 삽입
- 링크 추가
- 실행 취소/재실행

**내부 저장 형식:**
에디터는 HTML로 저장되며, 필요시 마크다운으로 변환 가능합니다.

```typescript
// 에디터 콘텐츠 예시
<h2>제목</h2>
<p>본문 텍스트</p>
<blockquote><p>인용구</p></blockquote>
<ul><li>리스트 항목</li></ul>
```

### 2.2 SEO 메타데이터 관리 (MetadataForm)

**관리 필드:**
- **Meta Title:** 검색 결과에 표시될 제목 (최대 60자)
- **Meta Description:** 검색 결과에 표시될 설명 (최대 160자)
- **Canonical URL:** 중복 콘텐츠 방지용 정규 URL

**미리보기:**
사용자가 입력한 메타데이터가 검색 결과에 어떻게 표시될지 실시간 미리보기를 제공합니다.

### 2.3 칼럼 관리 폼 (ColumnForm)

**입력 필드:**
- 제목, 슬러그 (URL), 카테고리, 작성자
- 읽기 시간, 썸네일 이미지 URL
- 발행 여부 (published)

**워크플로우:**
1. 기본 정보 입력
2. WYSIWYG 에디터로 콘텐츠 작성
3. SEO 메타데이터 입력
4. 저장 (DB에 저장 + SSG 빌드 트리거)

---

## 3. 데이터 구조

### 3.1 칼럼 데이터 모델

```typescript
interface Column {
  id: number;
  slug: string;                    // URL 슬러그 (고유값)
  title: string;                   // 칼럼 제목
  category: string;                // 카테고리
  author: string;                  // 작성자
  content: string;                 // HTML 형식의 콘텐츠
  metaTitle: string | null;        // SEO 메타 제목
  metaDescription: string | null;  // SEO 메타 설명
  canonicalUrl: string | null;     // 정규 URL
  thumbnailUrl: string | null;     // 썸네일 이미지 URL
  readingTime: number | null;      // 읽기 시간 (분)
  published: boolean;              // 발행 여부
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 API 요청/응답 예시

**칼럼 생성 요청:**
```typescript
POST /api/trpc/columns.create
{
  "slug": "column-001",
  "title": "인생의 대운이 바뀌기 전, 반드시 나타나는 징조 3가지",
  "category": "개운법",
  "author": "무운 역술팀",
  "content": "<h2>1. 갑자기 찾아오는 예상치 못한 어려움과 시련</h2><p>여러분, 혹시 요즘 하는 일마다...</p>",
  "metaTitle": "[가입X/100%무료] 인생의 대운이 바뀌기 전의 징조",
  "metaDescription": "대운이 오기 전에 나타나는 3가지 징조를 알아보고 긍정적으로 대처하는 방법을 배워보세요.",
  "canonicalUrl": "https://muunsaju.com/guide/column-001",
  "readingTime": 2,
  "published": true
}
```

**응답:**
```typescript
{
  "id": 1,
  "slug": "column-001",
  "title": "인생의 대운이 바뀌기 전, 반드시 나타나는 징조 3가지",
  "category": "개운법",
  "author": "무운 역술팀",
  "content": "<h2>1. 갑자기 찾아오는 예상치 못한 어려움과 시련</h2><p>여러분, 혹시 요즘 하는 일마다...</p>",
  "metaTitle": "[가입X/100%무료] 인생의 대운이 바뀌기 전의 징조",
  "metaDescription": "대운이 오기 전에 나타나는 3가지 징조를 알아보고 긍정적으로 대처하는 방법을 배워보세요.",
  "canonicalUrl": "https://muunsaju.com/guide/column-001",
  "thumbnailUrl": null,
  "readingTime": 2,
  "published": true,
  "createdAt": "2026-02-23T00:00:00Z",
  "updatedAt": "2026-02-23T00:00:00Z"
}
```

---

## 4. 향후 개발 로드맵

### 4.1 즉시 구현 필요 항목

#### 칼럼 목록 페이지 (ColumnList.tsx)
관리자가 작성된 모든 칼럼을 한눈에 볼 수 있는 테이블 또는 카드 레이아웃:
- 칼럼 제목, 카테고리, 작성자, 발행 상태
- 검색 및 필터링 기능
- 편집/삭제 액션 버튼
- 페이지네이션

#### 칼럼 편집 페이지 (ColumnEditor.tsx)
기존 칼럼을 수정하는 페이지:
- 칼럼 ID로 기존 데이터 로드
- ColumnForm으로 수정
- 저장 시 업데이트 프로시저 호출

#### 관리자 대시보드 (AdminDashboard.tsx)
어드민 시스템의 진입점:
- 최근 작성된 칼럼 목록
- 통계 (총 칼럼 수, 발행된 칼럼 수 등)
- 빠른 액션 (새 칼럼 작성, 카테고리 관리 등)

### 4.2 SSG 빌드 연동

**현재 상태:** 주석 처리된 상태

**구현 방법:**
```typescript
// server/db.ts에 추가
export async function triggerSSGBuild(columnId: number) {
  try {
    const response = await fetch(
      `${process.env.MUUN_BUILD_WEBHOOK_URL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MUUN_BUILD_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'column-update',
          columnId,
          timestamp: new Date().toISOString(),
        }),
      }
    );
    return response.ok;
  } catch (error) {
    console.error('Failed to trigger SSG build:', error);
    return false;
  }
}
```

**필수 환경 변수:**
- `MUUN_BUILD_WEBHOOK_URL`: 기존 무운 프로젝트의 빌드 웹훅 URL
- `MUUN_BUILD_TOKEN`: 빌드 웹훅 인증 토큰

### 4.3 이미지 업로드 기능

**현재 상태:** URL 기반 이미지 삽입만 지원

**개선 방향:**
1. 클라이언트에서 이미지 파일 선택
2. S3에 업로드 (storagePut 사용)
3. 반환된 URL을 에디터에 삽입

```typescript
// RichTextEditor.tsx 수정
const handleAddImage = async (file: File) => {
  const { url } = await storagePut(
    `columns/${Date.now()}-${file.name}`,
    await file.arrayBuffer(),
    file.type
  );
  editor.chain().focus().setImage({ src: url }).run();
};
```

### 4.4 테스트 작성

**필수 테스트:**
- 칼럼 CRUD 유닛 테스트 (Vitest)
- 에디터 컴포넌트 테스트
- 메타데이터 검증 테스트

**예시 (server/columns.test.ts):**
```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("columns", () => {
  it("should create a column", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, role: "admin" },
    } as any);

    const result = await caller.columns.create({
      slug: "test-column",
      title: "Test Column",
      category: "사주 기초",
      content: "<p>Test content</p>",
      metaTitle: "Test",
      metaDescription: "Test description",
    });

    expect(result.id).toBeDefined();
    expect(result.slug).toBe("test-column");
  });
});
```

### 4.5 성능 최적화

**번들 크기 최적화:**
- TipTap 필수 확장만 포함 (현재 구성: 약 80KB)
- 코드 스플리팅으로 ColumnEditor 페이지 지연 로딩

**데이터베이스 최적화:**
- `slug`, `category`, `published` 필드에 인덱스 추가
- 칼럼 목록 쿼리 캐싱 (Redis 활용 가능)

---

## 5. 사용 예시

### 5.1 새 칼럼 작성 워크플로우

1. **관리자 로그인**
   - Manus OAuth로 로그인
   - 관리자 권한 확인

2. **칼럼 작성 페이지 접근**
   - `/admin/columns/new` 경로 방문

3. **기본 정보 입력**
   - 제목: "인생의 대운이 바뀌기 전, 반드시 나타나는 징조 3가지"
   - 슬러그: "column-001"
   - 카테고리: "개운법"
   - 읽기 시간: 2분

4. **콘텐츠 작성**
   - WYSIWYG 에디터에서 텍스트 입력
   - 제목, 굵은 텍스트, 인용구 등 포맷 적용
   - 마크다운 기호는 보이지 않음

5. **SEO 메타데이터 입력**
   - Meta Title: "[가입X/100%무료] 인생의 대운이 바뀌기 전의 징조"
   - Meta Description: "대운이 오기 전에 나타나는 3가지 징조를..."
   - Canonical URL: "https://muunsaju.com/guide/column-001"

6. **저장**
   - 저장 버튼 클릭
   - 데이터베이스에 저장
   - SSG 빌드 트리거 (향후 구현)
   - 정적 HTML 생성 및 배포

---

## 6. 주요 파일 구조

```
muun-admin/
├── drizzle/
│   ├── schema.ts                    # 데이터베이스 스키마
│   └── 0001_lonely_zaran.sql        # 마이그레이션 파일
├── server/
│   ├── db.ts                        # 데이터베이스 쿼리 헬퍼
│   └── routers.ts                   # tRPC 라우터 (칼럼 CRUD)
├── client/src/
│   ├── components/
│   │   ├── RichTextEditor.tsx       # TipTap 에디터 래퍼
│   │   ├── RichTextEditor.css       # 에디터 스타일
│   │   ├── MetadataForm.tsx         # SEO 메타데이터 폼
│   │   └── ColumnForm.tsx           # 칼럼 작성/편집 폼
│   └── pages/
│       ├── ColumnList.tsx           # 칼럼 목록 (향후 구현)
│       └── ColumnEditor.tsx         # 칼럼 편집 (향후 구현)
├── ARCHITECTURE.md                  # 아키텍처 설계 문서
└── IMPLEMENTATION_GUIDE.md          # 본 문서
```

---

## 7. 환경 변수 설정

```bash
# .env.local (개발 환경)
DATABASE_URL=mysql://user:password@localhost:3306/muun_admin
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# SSG 빌드 연동 (향후 필요)
MUUN_BUILD_WEBHOOK_URL=https://your-muun-project.com/api/build
MUUN_BUILD_TOKEN=your-build-token
```

---

## 8. 문제 해결

### 에디터에서 마크다운 기호가 보이는 경우
- TipTap 확장 설정 확인
- `StarterKit` 설정에서 마크다운 관련 확장 제거

### 메타데이터가 저장되지 않는 경우
- 폼 검증 오류 확인 (콘솔 로그 확인)
- Zod 스키마 규칙 준수 확인 (Meta Title 최대 60자, Description 최대 160자)

### 칼럼 목록이 로드되지 않는 경우
- 관리자 권한 확인 (`user.role === 'admin'`)
- 데이터베이스 연결 상태 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인

---

## 9. 참고 자료

- [TipTap 공식 문서](https://tiptap.dev/docs)
- [tRPC 공식 문서](https://trpc.io)
- [React Hook Form 공식 문서](https://react-hook-form.com)
- [Zod 공식 문서](https://zod.dev)
- [Drizzle ORM 공식 문서](https://orm.drizzle.team)

---

## 10. 라이센스 및 기여

본 프로젝트는 MIT 라이센스 하에 배포됩니다. 기여는 환영합니다.

---

**마지막 업데이트:** 2026년 2월 23일  
**작성자:** Manus AI  
**버전:** 1.0.0 (초기 구현)

# 무운(MUUN) 사주 칼럼 어드민 시스템 - 아키텍처 설계

## 1. 프로젝트 개요

무운 사주는 로그인 없는 100% 무료 운세 서비스로, Vite + React 기반의 SPA를 SSG(Static Site Generation)로 사전 렌더링하여 1,000개 이상의 페이지를 정적 HTML로 제공합니다. 현재 빌드 후 스크립트(`scripts/inject-metadata.mjs`)를 통해 각 HTML에 캐노니컬 태그와 메타데이터를 직접 주입하는 독특한 구조를 운영하고 있습니다.

본 프로젝트는 이러한 기존 SSG 시스템과 연동하여 **코딩 없이 칼럼 콘텐츠를 작성하고 관리할 수 있는 어드민 시스템**을 구축하는 것을 목표로 합니다.

---

## 2. 핵심 요구사항 분석

### 2.1 WYSIWYG 에디터 요구사항

**핵심 원칙:** 사용자(13년 차 디자이너)는 마크다운 기호(`**`, `##` 등)를 절대 보지 않아야 합니다.

**필수 기능:**
- 제목 (H2, H3)
- 굵게, 기울임, 밑줄
- 인용구
- 이미지 삽입
- 구분선
- 리스트 (순서 있음/없음)
- 내부적으로는 깔끔한 마크다운 또는 HTML로 저장

### 2.2 SEO 메타데이터 관리

각 칼럼마다 다음 필드를 설정할 수 있어야 합니다:
- **Meta Title:** 검색 결과에 표시될 제목 (예: `[가입X/100%무료] 카리나 사주 분석`)
- **Meta Description:** 검색 결과에 표시될 요약 문구
- **Canonical URL:** 해당 칼럼의 고유 주소

### 2.3 데이터 파이프라인

1. **저장:** 작성된 글은 데이터베이스(MySQL/TiDB)에 저장
2. **빌드:** 글 저장 시 기존 SSG 빌드 시스템과 연동하여 정적 HTML 파일 생성
3. **배포:** 생성된 HTML에 메타데이터 주입 및 배포

---

## 3. 에디터 라이브러리 선정

### 3.1 후보 라이브러리 비교

| 항목 | TipTap | Quill | Toast UI Editor |
|------|--------|-------|-----------------|
| **React 지원** | ✅ 우수 | ✅ 좋음 | ⚠️ 제한적 |
| **마크다운 지원** | ✅ 양방향 | ✅ 제한적 | ✅ 우수 |
| **WYSIWYG 모드** | ✅ 기본 | ✅ 기본 | ✅ 전환 가능 |
| **커스터마이징** | ✅ 매우 유연 | ✅ 유연 | ⚠️ 제한적 |
| **번들 크기** | 작음 (~50KB) | 중간 (~60KB) | 큼 (~200KB) |
| **커뮤니티** | ✅ 활발 | ✅ 매우 활발 | ⚠️ 중간 |
| **TypeScript** | ✅ 완전 지원 | ⚠️ 부분 지원 | ⚠️ 부분 지원 |

### 3.2 선정 이유: **TipTap**

**TipTap을 선택한 이유:**

1. **Headless 아키텍처:** 완전히 커스터마이징 가능한 UI로, 디자이너의 감각을 최대한 반영할 수 있습니다.
2. **React 최적화:** React 19와 완벽하게 호환되며, 훅 기반 API로 깔끔한 통합이 가능합니다.
3. **양방향 마크다운 지원:** 마크다운을 JSON 형식으로 파싱하고, 다시 마크다운으로 직렬화할 수 있어 기존 SSG 시스템과 호환성이 높습니다.
4. **확장성:** 커스텀 노드와 마크를 쉽게 추가할 수 있어, 향후 사주 관련 특수 포맷 지원이 용이합니다.
5. **성능:** 트리 쉐이킹으로 필요한 기능만 번들에 포함되어 번들 크기가 작습니다.

---

## 4. 데이터 구조 설계

### 4.1 데이터베이스 스키마

```sql
-- 칼럼 테이블
CREATE TABLE columns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,           -- URL 슬러그
  title VARCHAR(255) NOT NULL,                 -- 칼럼 제목
  category VARCHAR(100) NOT NULL,              -- 카테고리 (사주기초, 개운법 등)
  author VARCHAR(100) DEFAULT '무운 역술팀',   -- 작성자
  content LONGTEXT NOT NULL,                   -- 마크다운 형식의 콘텐츠
  metaTitle VARCHAR(255),                      -- SEO 메타 제목
  metaDescription TEXT,                        -- SEO 메타 설명
  canonicalUrl VARCHAR(255),                   -- 캐노니컬 URL
  thumbnailUrl VARCHAR(255),                   -- 썸네일 이미지 URL
  readingTime INT,                             -- 읽기 시간 (분)
  published BOOLEAN DEFAULT FALSE,             -- 발행 여부
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 카테고리 테이블
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 콘텐츠 저장 형식

**내부 저장:** 마크다운 형식 (TipTap의 `markdown` 확장으로 변환)

```markdown
# 인생의 대운이 바뀌기 전, 반드시 나타나는 징조 3가지

## 1. 갑자기 찾아오는 예상치 못한 어려움과 시련

여러분, 혹시 요즘 하는 일마다 잘 안 풀리고...

> 이것은 인용구입니다.

- 리스트 항목 1
- 리스트 항목 2

**굵은 텍스트**와 *기울인 텍스트*
```

**TipTap 내부 형식:** JSON (ProseMirror 호환)

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "제목" }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "본문" }]
    }
  ]
}
```

---

## 5. 시스템 아키텍처

### 5.1 전체 데이터 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                    칼럼 어드민 시스템                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 관리자 인증                                              │
│     └─ Manus OAuth 연동 (기존 auth 시스템 활용)             │
│                                                              │
│  2. 칼럼 작성/편집                                           │
│     ├─ TipTap WYSIWYG 에디터 (마크다운 기호 미노출)         │
│     ├─ SEO 메타데이터 입력 폼                                │
│     └─ 미리보기 기능                                         │
│                                                              │
│  3. 데이터 저장                                              │
│     └─ 마크다운 형식으로 DB에 저장                          │
│                                                              │
│  4. SSG 빌드 연동                                            │
│     ├─ 저장 시 빌드 트리거                                   │
│     ├─ 정적 HTML 생성                                        │
│     └─ 메타데이터 주입 (기존 inject-metadata.mjs)          │
│                                                              │
│  5. 배포                                                     │
│     └─ 정적 HTML을 CDN에 배포                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 백엔드 API 구조 (tRPC)

```typescript
// server/routers.ts 확장
export const appRouter = router({
  columns: router({
    // 칼럼 목록 조회 (필터링, 페이지네이션)
    list: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(({ input, ctx }) => {
        // 관리자 권한 확인
        // 칼럼 목록 반환
      }),

    // 칼럼 상세 조회
    get: protectedProcedure
      .input(z.string())
      .query(({ input, ctx }) => {
        // 칼럼 상세 정보 반환
      }),

    // 칼럼 생성
    create: protectedProcedure
      .input(columnSchema)
      .mutation(({ input, ctx }) => {
        // 1. DB에 저장
        // 2. SSG 빌드 트리거
        // 3. 생성된 칼럼 반환
      }),

    // 칼럼 수정
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: columnSchema.partial(),
      }))
      .mutation(({ input, ctx }) => {
        // 1. DB 업데이트
        // 2. SSG 빌드 트리거
        // 3. 업데이트된 칼럼 반환
      }),

    // 칼럼 삭제
    delete: protectedProcedure
      .input(z.number())
      .mutation(({ input, ctx }) => {
        // 1. DB에서 삭제
        // 2. SSG 빌드 트리거
        // 3. 성공 응답
      }),
  }),
});
```

### 5.3 프론트엔드 컴포넌트 구조

```
client/src/pages/
├── ColumnList.tsx          # 칼럼 목록 페이지
├── ColumnEditor.tsx        # 칼럼 작성/편집 페이지
└── components/
    ├── ColumnTable.tsx     # 칼럼 목록 테이블
    ├── ColumnForm.tsx      # 칼럼 작성 폼
    ├── RichTextEditor.tsx  # TipTap 에디터 래퍼
    ├── MetadataForm.tsx    # SEO 메타데이터 폼
    └── ColumnPreview.tsx   # 미리보기 컴포넌트
```

---

## 6. SSG 빌드 연동 전략

### 6.1 기존 시스템 분석

기존 무운 프로젝트에서:
1. Vite + React로 SPA 빌드
2. 사전 렌더링으로 정적 HTML 생성
3. `scripts/inject-metadata.mjs` 스크립트로 메타데이터 주입

### 6.2 칼럼 어드민과의 연동 방식

**옵션 1: 웹훅 기반 (권장)**
- 칼럼 저장 시 기존 프로젝트의 빌드 API 호출
- 빌드 완료 후 메타데이터 주입
- 장점: 느슨한 결합, 확장성 높음

**옵션 2: 직접 통합**
- 어드민 프로젝트 내에서 빌드 스크립트 실행
- 단점: 강한 결합, 배포 복잡도 증가

**권장 구현:**
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

---

## 7. 보안 고려사항

### 7.1 인증 및 권한

- **인증:** 기존 Manus OAuth 시스템 활용
- **권한:** `user.role === 'admin'` 확인 (protectedProcedure 사용)
- **감사 로그:** 칼럼 생성/수정/삭제 시 로그 기록

### 7.2 콘텐츠 보안

- **XSS 방지:** TipTap의 기본 sanitization 활용
- **마크다운 검증:** 저장 전 마크다운 유효성 검사
- **이미지 업로드:** S3 저장소 활용, 안전한 URL 생성

---

## 8. 성능 최적화 전략

### 8.1 프론트엔드

- **코드 스플리팅:** ColumnEditor 페이지 지연 로딩
- **에디터 최적화:** TipTap 필수 확장만 번들에 포함
- **이미지 최적화:** 썸네일 자동 생성 및 WebP 변환

### 8.2 백엔드

- **데이터베이스 인덱싱:** `slug`, `category`, `published` 필드에 인덱스
- **캐싱:** 칼럼 목록 캐싱 (Redis 활용 가능)
- **배치 처리:** 대량 메타데이터 업데이트 시 배치 작업

---

## 9. 향후 확장 가능성

1. **협업 기능:** Yjs 기반 실시간 협업 편집
2. **버전 관리:** 칼럼 수정 이력 추적
3. **AI 보조:** 제목 생성, 요약 생성 등 AI 기능
4. **다국어 지원:** 칼럼 번역 기능
5. **분석:** 칼럼 조회수, 체류 시간 등 분석

---

## 10. 구현 로드맵

| 단계 | 작업 | 예상 기간 |
|------|------|----------|
| 1 | 데이터베이스 스키마 설계 및 마이그레이션 | 1-2일 |
| 2 | 백엔드 API (CRUD) 구현 | 2-3일 |
| 3 | TipTap 에디터 통합 | 2-3일 |
| 4 | 칼럼 관리 UI 구현 | 3-4일 |
| 5 | SSG 빌드 연동 | 2-3일 |
| 6 | 테스트 및 최적화 | 2-3일 |
| 7 | 배포 및 운영 | 1-2일 |

---

## 참고 자료

- [TipTap 공식 문서](https://tiptap.dev/docs)
- [TipTap Markdown 확장](https://tiptap.dev/docs/editor/markdown)
- [React 19 최적화 가이드](https://react.dev)
- [tRPC 공식 문서](https://trpc.io)

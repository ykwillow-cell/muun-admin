# 무운(MUUN) 사주 - 칼럼 어드민 시스템

> 로그인 없는 100% 무료 운세 서비스를 위한 칼럼 관리 어드민 시스템

## 🚀 배포 정보

- **프로덕션 URL:** https://muun-admin.vercel.app
- **GitHub 저장소:** https://github.com/ykwillow-cell/muun-admin
- **배포 플랫폼:** Vercel (자동 배포 활성화)

## 📋 주요 기능

### 1. Rich Text Editor (WYSIWYG)
- 마크다운 기호 완전 미노출
- 제목(H2, H3), 굵게, 기울임, 인용구 지원
- 이미지 삽입, 링크 추가, 구분선 등 기본 서식 지원

### 2. 고급 타이포그래피 제어
- **텍스트 크기:** 14px, 16px, 18px, 20px, 24px
- **폰트 두께:** Light(300), Regular(400), Medium(500), Bold(700)
- 직관적인 드롭다운 UI로 마우스 클릭만으로 조절

### 3. 색상 제어
- 무운 브랜드 컬러 팔레트 (12가지 색상)
- ColorPicker 컴포넌트로 텍스트 색상 선택
- 현재 색상 미리보기 및 제거 기능

### 4. SEO 메타데이터 관리
- Meta Title, Description, Canonical URL 설정
- 각 칼럼마다 고유한 SEO 정보 관리

### 5. 칼럼 목록 페이지
- 모든 칼럼 조회 (테이블 형식)
- 제목 검색, 카테고리 필터, 발행 상태 필터
- 페이지네이션으로 대량 칼럼 관리
- 편집/삭제 액션 버튼

## 🛠 기술 스택

- **프론트엔드:** React 19 + Vite + Tailwind CSS 4
- **백엔드:** Express 4 + tRPC 11
- **데이터베이스:** MySQL (Drizzle ORM)
- **에디터:** TipTap 3 (ProseMirror 기반)
- **UI 컴포넌트:** shadcn/ui
- **배포:** Vercel

## 📦 설치 및 실행

### 개발 환경

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 데이터베이스 마이그레이션
pnpm db:push
```

### 프로덕션 빌드

```bash
# 빌드
pnpm build

# 프로덕션 실행
pnpm start
```

## 🔄 자동 배포

GitHub main 브랜치에 푸시하면 자동으로 Vercel에 배포됩니다.

```bash
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main
```

## 📚 문서

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 전체 아키텍처 설계
- [TYPOGRAPHY_GUIDE.md](./TYPOGRAPHY_GUIDE.md) - 타이포그래피 기능 가이드
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - 구현 현황 및 로드맵

## 🎨 브랜드 컬러 팔레트

| 색상명 | HEX | 설명 |
|--------|-----|------|
| Deep Gold | #C9A961 | 전통적인 금색, 고급스러움 |
| Midnight Blue | #1a237e | 신비로운 밤하늘, 깊이감 |
| Sage Green | #6b8e23 | 자연의 평온함, 조화 |
| Rose Red | #c41e3a | 에너지, 열정 |
| Coral | #ff6b6b | 따뜻함, 친근함 |
| Purple | #7c3aed | 신비로움, 영성 |

## 🚀 다음 단계

- [ ] 이미지 업로드 기능 (S3 연동)
- [ ] SSG 빌드 웹훅 연동
- [ ] 칼럼 미리보기 기능
- [ ] 고급 권한 관리 (에디터, 뷰어 등)
- [ ] 버전 관리 및 복원 기능

## 📝 라이선스

MIT

---

**마지막 업데이트:** 2026년 2월 23일  
**개발자:** Manus AI  
**프로젝트 상태:** 개발 중

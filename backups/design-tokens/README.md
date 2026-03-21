# Design Token Backups

이 디렉토리는 Supabase `design_themes` 테이블의 자동 백업 파일을 저장합니다.

## 파일 구조

```
backups/design-tokens/
├── README.md              # 이 파일
├── latest.json            # 최신 전체 테마 스냅샷 (항상 최신 상태)
├── active-theme.json      # 현재 활성화된 테마만 별도 저장
├── backup-meta.json       # 마지막 백업 시간, 테마 수 등 메타데이터
└── snapshots/             # 날짜별 이력 스냅샷 (30일 보관)
    └── YYYY-MM-DDTHH-MM-SS.json
```

## 자동 실행 일정

- **매일 오전 3시 (KST)** 자동 실행
- 변경사항이 없으면 커밋하지 않음 (불필요한 이력 방지)
- 30일 이상 된 스냅샷은 자동 삭제

## 수동 실행 방법

GitHub Actions 탭 → **Backup Design Tokens** → **Run workflow** 클릭

## 데이터 복구 방법

`latest.json` 또는 특정 날짜의 스냅샷 파일을 Supabase에 재삽입합니다.

```bash
# 예시: latest.json을 Supabase에 복구
node scripts/restore-design-tokens.mjs backups/design-tokens/latest.json
```

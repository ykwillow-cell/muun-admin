-- =====================================================
-- MUUN Admin - dreams 테이블 마이그레이션
-- muunsaju.com/dream 페이지와 연동되는 꿈해몽 테이블
-- =====================================================

-- =====================================================
-- dreams 테이블 (꿈해몽 콘텐츠 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS dreams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 핵심 콘텐츠
  keyword TEXT NOT NULL,                          -- 꿈 키워드 (예: 돼지, 불, 뱀)
  slug TEXT NOT NULL UNIQUE,                      -- SEO URL 슬러그 (예: pig-dream)
  interpretation TEXT NOT NULL,                   -- 핵심 해몽 요약
  traditional_meaning TEXT,                       -- 전통적 의미
  psychological_meaning TEXT,                     -- 심리학적 분석

  -- 분류
  category TEXT NOT NULL DEFAULT 'animal'
    CHECK (category IN ('animal', 'nature', 'person', 'object', 'action', 'emotion', 'place', 'other')),

  -- 등급 및 점수
  grade TEXT NOT NULL DEFAULT 'good'
    CHECK (grade IN ('great', 'good', 'bad')),
  score INTEGER NOT NULL DEFAULT 70
    CHECK (score >= 0 AND score <= 100),

  -- SEO 메타데이터
  meta_title TEXT,
  meta_description TEXT,

  -- 발행 상태
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_dreams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dreams_updated_at
  BEFORE UPDATE ON dreams
  FOR EACH ROW
  EXECUTE FUNCTION update_dreams_updated_at();

-- =====================================================
-- RLS (Row Level Security) 정책
-- =====================================================
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: published=true인 꿈해몽은 누구나 읽기 가능
CREATE POLICY "Public can read published dreams"
  ON dreams FOR SELECT
  USING (published = TRUE);

-- 인증된 사용자: 모든 꿈해몽 읽기/쓰기 가능
CREATE POLICY "Authenticated users can read all dreams"
  ON dreams FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can insert dreams"
  ON dreams FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update dreams"
  ON dreams FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can delete dreams"
  ON dreams FOR DELETE
  TO authenticated
  USING (TRUE);

-- =====================================================
-- 인덱스
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_dreams_published ON dreams(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_dreams_category ON dreams(category);
CREATE INDEX IF NOT EXISTS idx_dreams_slug ON dreams(slug);
CREATE INDEX IF NOT EXISTS idx_dreams_keyword ON dreams(keyword);
CREATE INDEX IF NOT EXISTS idx_dreams_created_at ON dreams(created_at DESC);

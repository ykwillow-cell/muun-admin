-- =====================================================
-- MUUN Admin - 운세 사전(fortune_dictionary) 테이블 마이그레이션
-- muunsaju.com/fortune-dictionary 페이지와 연동
-- =====================================================

-- fortune_dictionary 테이블 생성
CREATE TABLE IF NOT EXISTS fortune_dictionary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 기본 정보
  title TEXT NOT NULL,                        -- 용어명 (예: 사주팔자)
  slug TEXT NOT NULL UNIQUE,                  -- SEO URL 슬러그 (예: saju-palcha)
  subtitle TEXT,                              -- 부제목 (예: 하늘의 기운을 나타내는 10가지 기호)
  summary TEXT NOT NULL,                      -- 핵심 요약 (meta description용)

  -- 본문 내용
  original_meaning TEXT NOT NULL,             -- 원래 의미 (고전적 해석)
  modern_interpretation TEXT NOT NULL,        -- 현대적 해석 (쉬운 풀이)
  muun_advice TEXT NOT NULL,                  -- 무운의 조언

  -- 분류
  category TEXT NOT NULL DEFAULT 'basic'
    CHECK (category IN ('basic', 'stem', 'branch', 'ten-stem', 'evil-spirit', 'luck-flow', 'relation')),
  category_label TEXT NOT NULL DEFAULT '사주 기초',

  -- 태그 (배열)
  tags TEXT[],

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- 발행 상태
  published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT NOW(),

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 자동 업데이트 트리거 (이미 함수가 있으면 재사용)
CREATE OR REPLACE FUNCTION update_fortune_dictionary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_fortune_dictionary_updated_at ON fortune_dictionary;
CREATE TRIGGER update_fortune_dictionary_updated_at
  BEFORE UPDATE ON fortune_dictionary
  FOR EACH ROW
  EXECUTE FUNCTION update_fortune_dictionary_updated_at();

-- RLS(Row Level Security) 설정
ALTER TABLE fortune_dictionary ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자만 CRUD 가능
CREATE POLICY "Authenticated users can manage fortune_dictionary"
  ON fortune_dictionary
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 공개 읽기 허용 (사이트 프론트에서 anon으로 조회)
CREATE POLICY "Public can read published fortune_dictionary"
  ON fortune_dictionary
  FOR SELECT
  TO anon
  USING (published = true);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_fortune_dictionary_category ON fortune_dictionary(category);
CREATE INDEX IF NOT EXISTS idx_fortune_dictionary_published ON fortune_dictionary(published);
CREATE INDEX IF NOT EXISTS idx_fortune_dictionary_slug ON fortune_dictionary(slug);
CREATE INDEX IF NOT EXISTS idx_fortune_dictionary_created_at ON fortune_dictionary(created_at DESC);

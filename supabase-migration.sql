-- =====================================================
-- MUUN Admin - Supabase 테이블 마이그레이션
-- muunsaju.com/guide 페이지와 연동되는 칼럼 테이블 재설계
-- =====================================================

-- 기존 테이블 삭제 (데이터 없으므로 안전)
DROP TABLE IF EXISTS column_data CASCADE;
DROP TABLE IF EXISTS columns CASCADE;

-- =====================================================
-- columns 테이블 (메인 칼럼 테이블)
-- =====================================================
CREATE TABLE columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 기본 정보
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  
  -- 분류
  category TEXT NOT NULL DEFAULT 'luck' CHECK (category IN ('luck', 'basic', 'relationship', 'health', 'money', 'flow')),
  
  -- 메타 정보
  author TEXT NOT NULL DEFAULT '무운 역술팀',
  thumbnail_url TEXT,
  read_time INTEGER DEFAULT 5,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  keywords TEXT[], -- 키워드 배열
  
  -- 발행 상태
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_columns_updated_at
  BEFORE UPDATE ON columns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (Row Level Security) 정책
-- =====================================================
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: published=true인 칼럼은 누구나 읽기 가능
CREATE POLICY "Public can read published columns"
  ON columns FOR SELECT
  USING (published = TRUE);

-- 인증된 사용자: 모든 칼럼 읽기/쓰기 가능
CREATE POLICY "Authenticated users can read all columns"
  ON columns FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can insert columns"
  ON columns FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update columns"
  ON columns FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can delete columns"
  ON columns FOR DELETE
  TO authenticated
  USING (TRUE);

-- =====================================================
-- 인덱스
-- =====================================================
CREATE INDEX idx_columns_published ON columns(published, published_at DESC);
CREATE INDEX idx_columns_category ON columns(category);
CREATE INDEX idx_columns_created_at ON columns(created_at DESC);

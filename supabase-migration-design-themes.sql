-- =====================================================
-- design_themes 테이블 생성
-- 무운(MuUn) 디자인 시스템 관리 어드민
-- =====================================================

CREATE TABLE IF NOT EXISTS design_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  colors JSONB NOT NULL DEFAULT '{}',
  typography JSONB NOT NULL DEFAULT '{}',
  gradients JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_design_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER design_themes_updated_at
  BEFORE UPDATE ON design_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_design_themes_updated_at();

-- RLS 정책 (인증된 사용자만 접근)
ALTER TABLE design_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON design_themes
  FOR ALL USING (true);

-- 기본 테마 데이터 삽입 (현재 muunsaju.com 라이트 모드 기준)
INSERT INTO design_themes (name, description, is_active, colors, typography, gradients) VALUES (
  '기본 라이트 테마',
  '무운 기본 라이트 모드 테마 (Galaxy AI 퍼플 + 토스 레이아웃)',
  true,
  '{
    "--background": "#f2f4f6",
    "--foreground": "#191f28",
    "--foreground-secondary": "#4e5968",
    "--foreground-tertiary": "#8b95a1",
    "--card": "#ffffff",
    "--card-foreground": "#191f28",
    "--primary": "#6B5FFF",
    "--primary-foreground": "#ffffff",
    "--primary-light": "#8B7FFF",
    "--primary-tint": "rgba(107,95,255,0.08)",
    "--secondary": "#f2f4f6",
    "--secondary-foreground": "#191f28",
    "--muted": "#f2f4f6",
    "--muted-foreground": "#8b95a1",
    "--accent": "rgba(107,95,255,0.08)",
    "--accent-foreground": "#6B5FFF",
    "--destructive": "#dc2626",
    "--destructive-foreground": "#ffffff",
    "--border": "#e8ebed",
    "--input": "#f2f4f6",
    "--ring": "rgba(107,95,255,0.35)",
    "--radius": "1rem"
  }',
  '{
    "--md-display-large": "57px",
    "--md-display-large-lh": "64px",
    "--md-display-medium": "45px",
    "--md-display-medium-lh": "52px",
    "--md-headline-large": "32px",
    "--md-headline-large-lh": "40px",
    "--md-headline-medium": "28px",
    "--md-headline-medium-lh": "36px",
    "--md-headline-small": "24px",
    "--md-headline-small-lh": "32px",
    "--md-title-large": "22px",
    "--md-title-large-lh": "28px",
    "--md-title-medium": "16px",
    "--md-title-medium-lh": "24px",
    "--md-body-large": "16px",
    "--md-body-large-lh": "24px",
    "--md-body-medium": "14px",
    "--md-body-medium-lh": "20px",
    "--md-label-large": "14px",
    "--md-label-large-lh": "20px",
    "--md-label-small": "11px",
    "--md-label-small-lh": "16px"
  }',
  '{
    "--aurora": "linear-gradient(135deg, #6B5FFF 0%, #60C8D4 60%, #A8E6CF 100%)",
    "--aurora-indigo": "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    "--aurora-teal": "linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)",
    "--aurora-slate": "linear-gradient(135deg, #334155 0%, #475569 100%)"
  }'
);

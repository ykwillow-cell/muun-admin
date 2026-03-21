import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useDesignTheme,
  useCreateDesignTheme,
  useUpdateDesignTheme,
  useActivateDesignTheme,
} from "@/lib/queries";
import { DESIGN_TOKEN_DEFINITIONS, type DesignThemeFormData } from "@/lib/supabase";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Palette,
  Save,
  Search,
  Sparkles,
  Type,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";

// 기본 테마 초기값 (무운 사이트 실제 CSS 변수 기반)
const DEFAULT_COLORS: Record<string, string> = {
  "--background": "#f2f4f6",
  "--foreground": "#191f28",
  "--foreground-secondary": "#4e5968",
  "--foreground-tertiary": "#8b95a1",
  "--card": "#ffffff",
  "--card-foreground": "#191f28",
  "--primary": "#6B5FFF",
  "--primary-foreground": "#ffffff",
  "--primary-light": "#8B7FFF",
  "--secondary": "#f2f4f6",
  "--secondary-foreground": "#191f28",
  "--muted": "#f2f4f6",
  "--muted-foreground": "#8b95a1",
  "--accent": "rgba(107,95,255,0.08)",
  "--accent-foreground": "#6B5FFF",
  "--destructive": "#dc2626",
  "--border": "#e8ebed",
  "--input": "#f2f4f6",
  "--ring": "rgba(107,95,255,0.35)",
};

const DEFAULT_TYPOGRAPHY: Record<string, string> = {
  "--font-display": "'Noto Serif KR', serif",
  "--font-body": "'Noto Sans KR', sans-serif",
  "--font-size-display-large": "57px",
  "--font-size-display-medium": "45px",
  "--font-size-display-small": "36px",
  "--font-size-headline-large": "32px",
  "--font-size-headline-medium": "28px",
  "--font-size-headline-small": "24px",
  "--font-size-title-large": "22px",
  "--font-size-title-medium": "16px",
  "--font-size-body-large": "16px",
  "--font-size-body-medium": "14px",
  "--font-size-body-small": "12px",
  "--font-size-label-large": "14px",
  "--font-size-label-medium": "12px",
  "--font-size-label-small": "11px",
};

const DEFAULT_GRADIENTS: Record<string, string> = {
  "--aurora": "linear-gradient(135deg, #6B5FFF 0%, #60C8D4 60%, #A8E6CF 100%)",
  "--gradient-aurora-1": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "--gradient-aurora-2": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "--gradient-aurora-3": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "--gradient-primary": "linear-gradient(135deg, #6B5FFF 0%, #9c27b0 100%)",
};

const EMPTY_FORM: DesignThemeFormData = {
  name: "",
  description: "",
  is_active: false,
  colors: { ...DEFAULT_COLORS },
  typography: { ...DEFAULT_TYPOGRAPHY },
  gradients: { ...DEFAULT_GRADIENTS },
};

// 색상인지 판별 (hex, rgb, rgba 형식)
function isColorValue(value: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(value) || /^rgb/.test(value);
}

// ─────────────────────────────────────────────────────────────
// 실제 무운 사이트 UI 미리보기 컴포넌트
// ─────────────────────────────────────────────────────────────
interface MuunPreviewProps {
  colors: Record<string, string>;
  gradients: Record<string, string>;
}

function MuunPreview({ colors, gradients }: MuunPreviewProps) {
  const c = (key: string, fallback: string) => colors[key] || fallback;
  const g = (key: string, fallback: string) => gradients[key] || fallback;

  return (
    <div
      className="rounded-2xl overflow-hidden border border-border shadow-lg"
      style={{ width: "100%", maxWidth: 320, margin: "0 auto", fontSize: 12 }}
    >
      {/* ── GNB ── */}
      <div
        style={{
          backgroundColor: c("--card", "#ffffff"),
          borderBottom: `1px solid ${c("--border", "#e8ebed")}`,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: c("--primary", "#6B5FFF") }}>무운</span>
        <Search size={15} style={{ color: c("--foreground-secondary", "#4e5968") }} />
      </div>

      {/* ── 통계 바 ── */}
      <div
        style={{
          backgroundColor: c("--foreground", "#191f28"),
          display: "flex",
          justifyContent: "space-around",
          padding: "8px 0",
        }}
      >
        {[["1만+", "누적 이용자"], ["13가지", "무료 서비스"], ["정통 명리학", "사주 이론 기반"]].map(([val, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 11 }}>{val}</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 9 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── 히어로 섹션 ── */}
      <div
        style={{
          background: g("--aurora", "linear-gradient(135deg, #6B5FFF 0%, #60C8D4 60%, #A8E6CF 100%)"),
          padding: "20px 14px 16px",
        }}
      >
        <div style={{ marginBottom: 6 }}>
          <span
            style={{
              display: "inline-block",
              border: "1px solid rgba(255,255,255,0.6)",
              borderRadius: 999,
              padding: "2px 8px",
              color: "rgba(255,255,255,0.9)",
              fontSize: 9,
              marginBottom: 8,
            }}
          >
            ● 정통 명리학 기반 · 100% 무료
          </span>
        </div>
        <div style={{ color: "#ffffff", fontWeight: 800, fontSize: 18, lineHeight: 1.3, marginBottom: 4 }}>
          생년월일로 보는<br />나의 사주
        </div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, marginBottom: 14 }}>
          회원가입 없이 지금 바로 확인하세요
        </div>

        {/* 입력 폼 카드 */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.18)",
            borderRadius: 12,
            padding: "10px 10px 8px",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* 탭 */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            <div
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 8,
                padding: "5px 0",
                textAlign: "center",
                fontWeight: 600,
                fontSize: 10,
                color: c("--foreground", "#191f28"),
              }}
            >
              ① 생년월일
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "transparent",
                borderRadius: 8,
                padding: "5px 0",
                textAlign: "center",
                fontSize: 10,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              ② 상세 정보
            </div>
          </div>
          {/* 인풋 */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: 8,
              padding: "7px 10px",
              color: "rgba(255,255,255,0.7)",
              fontSize: 10,
              marginBottom: 6,
            }}
          >
            예) 1993. 05. 21
          </div>
          {/* 버튼 */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: 8,
              padding: "7px 10px",
              textAlign: "center",
              color: "rgba(255,255,255,0.85)",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            다음 단계로 →
          </div>
        </div>

        {/* 배지 */}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {["✦ 100% 무료", "✦ 회원가입 없음", "✦ 저장 안함"].map(text => (
            <div
              key={text}
              style={{
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: 999,
                padding: "2px 7px",
                color: "rgba(255,255,255,0.85)",
                fontSize: 8,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── 콘텐츠 영역 ── */}
      <div style={{ backgroundColor: c("--background", "#f2f4f6"), padding: "12px 10px", display: "flex", flexDirection: "column", gap: 8 }}>

        {/* 섹션 타이틀 */}
        <div style={{ fontWeight: 700, fontSize: 12, color: c("--foreground", "#191f28") }}>
          오늘의 추천 칼럼
        </div>

        {/* 카드 1 */}
        <div
          style={{
            backgroundColor: c("--card", "#ffffff"),
            borderRadius: 10,
            border: `1px solid ${c("--border", "#e8ebed")}`,
            padding: "10px",
            display: "flex",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: g("--gradient-primary", "linear-gradient(135deg, #6B5FFF 0%, #9c27b0 100%)"),
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: c("--foreground", "#191f28"),
                marginBottom: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              2025년 을사년 사주 풀이
            </div>
            <div style={{ fontSize: 9, color: c("--foreground-secondary", "#4e5968"), lineHeight: 1.4 }}>
              새해 운세와 주요 변화를 살펴봅니다
            </div>
            <div style={{ marginTop: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: c("--accent", "rgba(107,95,255,0.08)"),
                  color: c("--accent-foreground", "#6B5FFF"),
                  borderRadius: 999,
                  padding: "1px 6px",
                  fontSize: 8,
                  fontWeight: 600,
                }}
              >
                사주
              </span>
            </div>
          </div>
        </div>

        {/* 카드 2 */}
        <div
          style={{
            backgroundColor: c("--card", "#ffffff"),
            borderRadius: 10,
            border: `1px solid ${c("--border", "#e8ebed")}`,
            padding: "10px",
            display: "flex",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: g("--gradient-aurora-2", "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"),
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: c("--foreground", "#191f28"),
                marginBottom: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              꿈에서 뱀을 봤다면?
            </div>
            <div style={{ fontSize: 9, color: c("--foreground-secondary", "#4e5968"), lineHeight: 1.4 }}>
              꿈해몽으로 알아보는 길몽과 흉몽
            </div>
            <div style={{ marginTop: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: "rgba(240,147,251,0.12)",
                  color: "#c026d3",
                  borderRadius: 999,
                  padding: "1px 6px",
                  fontSize: 8,
                  fontWeight: 600,
                }}
              >
                꿈해몽
              </span>
            </div>
          </div>
        </div>

        {/* 주요 버튼 */}
        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{
              flex: 1,
              backgroundColor: c("--primary", "#6B5FFF"),
              color: c("--primary-foreground", "#ffffff"),
              borderRadius: 8,
              padding: "7px 0",
              textAlign: "center",
              fontWeight: 600,
              fontSize: 10,
            }}
          >
            사주 보기
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: c("--secondary", "#f2f4f6"),
              color: c("--secondary-foreground", "#191f28"),
              border: `1px solid ${c("--border", "#e8ebed")}`,
              borderRadius: 8,
              padding: "7px 0",
              textAlign: "center",
              fontWeight: 600,
              fontSize: 10,
            }}
          >
            꿈해몽
          </div>
        </div>

        {/* 힌트 텍스트 */}
        <div style={{ fontSize: 9, color: c("--muted-foreground", "#8b95a1"), textAlign: "center" }}>
          플레이스홀더 · 비활성 상태 텍스트 예시
        </div>
      </div>

      {/* ── 바텀 네비게이션 ── */}
      <div
        style={{
          backgroundColor: c("--card", "#ffffff"),
          borderTop: `1px solid ${c("--border", "#e8ebed")}`,
          display: "flex",
          justifyContent: "space-around",
          padding: "8px 0 10px",
        }}
      >
        {[
          { label: "홈", active: true },
          { label: "칼럼", active: false },
          { label: "사전", active: false },
          { label: "MY", active: false },
        ].map(({ label, active }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                backgroundColor: active ? c("--primary", "#6B5FFF") : c("--muted", "#f2f4f6"),
                margin: "0 auto 3px",
              }}
            />
            <div
              style={{
                fontSize: 8,
                fontWeight: active ? 700 : 400,
                color: active ? c("--primary", "#6B5FFF") : c("--muted-foreground", "#8b95a1"),
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

export default function DesignThemeEditor() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isEdit = !!params.id && params.id !== "new";

  const { data: existingTheme, isLoading } = useDesignTheme(isEdit ? params.id : "");
  const createMutation = useCreateDesignTheme();
  const updateMutation = useUpdateDesignTheme();
  const activateMutation = useActivateDesignTheme();

  const [form, setForm] = useState<DesignThemeFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const [previewVisible, setPreviewVisible] = useState(true);

  // 기존 테마 데이터 로드
  useEffect(() => {
    if (existingTheme) {
      setForm({
        name: existingTheme.name,
        description: existingTheme.description || "",
        is_active: existingTheme.is_active,
        colors: { ...DEFAULT_COLORS, ...existingTheme.colors },
        typography: { ...DEFAULT_TYPOGRAPHY, ...existingTheme.typography },
        gradients: { ...DEFAULT_GRADIENTS, ...existingTheme.gradients },
      });
    }
  }, [existingTheme]);

  const handleColorChange = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  const handleTypographyChange = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      typography: { ...prev.typography, [key]: value },
    }));
  };

  const handleGradientChange = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      gradients: { ...prev.gradients, [key]: value },
    }));
  };

  const handleSave = async (activateAfterSave = false) => {
    if (!form.name.trim()) {
      toast.error("테마 이름을 입력해 주세요.");
      return;
    }

    setIsSaving(true);
    try {
      let savedId: string;
      if (isEdit) {
        const result = await updateMutation.mutateAsync({ id: params.id, data: form });
        savedId = result.id;
        toast.success("테마가 저장되었습니다.");
      } else {
        const result = await createMutation.mutateAsync(form);
        savedId = result.id;
        toast.success("새 테마가 생성되었습니다.");
      }

      if (activateAfterSave) {
        await activateMutation.mutateAsync(savedId);
        toast.success("테마가 활성화되었습니다.");
      }

      setLocation("/design/themes");
    } catch {
      toast.error("저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isEdit) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  // 그룹별로 토큰 분류
  const colorGroups = DESIGN_TOKEN_DEFINITIONS.colors.reduce((acc, token) => {
    if (!acc[token.group]) acc[token.group] = [];
    acc[token.group].push(token);
    return acc;
  }, {} as Record<string, typeof DESIGN_TOKEN_DEFINITIONS.colors>);

  const typographyGroups = DESIGN_TOKEN_DEFINITIONS.typography.reduce((acc, token) => {
    if (!acc[token.group]) acc[token.group] = [];
    acc[token.group].push(token);
    return acc;
  }, {} as Record<string, typeof DESIGN_TOKEN_DEFINITIONS.typography>);

  const gradientGroups = DESIGN_TOKEN_DEFINITIONS.gradients.reduce((acc, token) => {
    if (!acc[token.group]) acc[token.group] = [];
    acc[token.group].push(token);
    return acc;
  }, {} as Record<string, typeof DESIGN_TOKEN_DEFINITIONS.gradients>);

  // 색상 탭일 때만 미리보기를 우측에 고정 표시
  const showSidePreview = previewVisible && activeTab === "colors";

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/design/themes")}
              className="gap-1.5 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              목록으로
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                {isEdit ? "테마 편집" : "새 테마 만들기"}
              </h1>
              {existingTheme?.is_active && (
                <Badge variant="default" className="gap-1 mt-1 text-xs">
                  <Zap className="h-2.5 w-2.5" />
                  현재 활성 테마
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewVisible(!previewVisible)}
              className="gap-1.5"
            >
              {previewVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {previewVisible ? "미리보기 숨기기" : "미리보기"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              저장
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="gap-1.5"
            >
              <Zap className="h-4 w-4" />
              저장 후 활성화
            </Button>
          </div>
        </div>

        {/* 메인 레이아웃: 편집 영역 + 미리보기 패널 */}
        <div className={`grid gap-6 items-start ${showSidePreview ? "grid-cols-1 xl:grid-cols-[1fr_340px]" : "grid-cols-1"}`}>

          {/* ── 편집 영역 ── */}
          <div className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">테마 이름 <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="예: 무운 기본 테마, 봄 시즌 테마"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="이 테마에 대한 간단한 설명을 입력하세요."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 토큰 편집 탭 */}
            <Card>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="colors" className="gap-1.5">
                      <Palette className="h-3.5 w-3.5" />
                      색상
                    </TabsTrigger>
                    <TabsTrigger value="typography" className="gap-1.5">
                      <Type className="h-3.5 w-3.5" />
                      타이포그래피
                    </TabsTrigger>
                    <TabsTrigger value="gradients" className="gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      그라디언트
                    </TabsTrigger>
                  </TabsList>

                  {/* ── 색상 탭 ── */}
                  <TabsContent value="colors" className="space-y-6">
                    {Object.entries(colorGroups).map(([group, tokens]) => (
                      <div key={group}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <span className="h-px flex-1 bg-border" />
                          {group}
                          <span className="h-px flex-1 bg-border" />
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {tokens.map(token => {
                            const value = form.colors[token.key] || "";
                            const isColor = isColorValue(value);
                            const tokenDef = token as typeof token & { description?: string; usedIn?: string[] };
                            return (
                              <div key={token.key} className="space-y-1.5 p-3 rounded-lg border border-border/50 bg-card hover:border-border transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-0.5 flex-1 min-w-0">
                                    <Label className="text-xs font-semibold text-foreground">{token.label}</Label>
                                    {tokenDef.description && (
                                      <p className="text-xs text-muted-foreground leading-relaxed">{tokenDef.description}</p>
                                    )}
                                  </div>
                                  <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0 font-mono">
                                    {token.key}
                                  </code>
                                </div>
                                {tokenDef.usedIn && tokenDef.usedIn.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {tokenDef.usedIn.map((place: string) => (
                                      <span
                                        key={place}
                                        className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-primary/8 text-primary font-medium border border-primary/15"
                                      >
                                        {place}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-2 items-center">
                                  {isColor && (
                                    <input
                                      type="color"
                                      value={value.startsWith("#") ? value : "#6B5FFF"}
                                      onChange={e => handleColorChange(token.key, e.target.value)}
                                      className="h-9 w-9 rounded-md border border-input cursor-pointer p-0.5 bg-transparent"
                                      title="색상 선택"
                                    />
                                  )}
                                  <Input
                                    value={value}
                                    onChange={e => handleColorChange(token.key, e.target.value)}
                                    placeholder="#000000 또는 rgba(0,0,0,0.5)"
                                    className="flex-1 font-mono text-sm h-9"
                                  />
                                  {isColor && (
                                    <div
                                      className="h-9 w-9 rounded-md border border-border shrink-0 shadow-sm"
                                      style={{ backgroundColor: value }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  {/* ── 타이포그래피 탭 ── */}
                  <TabsContent value="typography" className="space-y-6">
                    {Object.entries(typographyGroups).map(([group, tokens]) => (
                      <div key={group}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <span className="h-px flex-1 bg-border" />
                          {group}
                          <span className="h-px flex-1 bg-border" />
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {tokens.map(token => {
                            const value = form.typography[token.key] || "";
                            const isFontSize = token.key.includes("font-size");
                            const tokenDef = token as typeof token & { description?: string; usedIn?: string[] };
                            return (
                              <div key={token.key} className="space-y-1.5 p-3 rounded-lg border border-border/50 bg-card hover:border-border transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-0.5 flex-1 min-w-0">
                                    <Label className="text-xs font-semibold text-foreground">{token.label}</Label>
                                    {tokenDef.description && (
                                      <p className="text-xs text-muted-foreground leading-relaxed">{tokenDef.description}</p>
                                    )}
                                  </div>
                                  <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0 font-mono">
                                    {token.key}
                                  </code>
                                </div>
                                {tokenDef.usedIn && tokenDef.usedIn.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {tokenDef.usedIn.map((place: string) => (
                                      <span
                                        key={place}
                                        className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-primary/8 text-primary font-medium border border-primary/15"
                                      >
                                        {place}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-2 items-center">
                                  <Input
                                    value={value}
                                    onChange={e => handleTypographyChange(token.key, e.target.value)}
                                    placeholder={isFontSize ? "16px" : "'Noto Sans KR', sans-serif"}
                                    className="flex-1 font-mono text-sm h-9"
                                  />
                                  {isFontSize && value && (
                                    <div
                                      className="shrink-0 text-foreground font-medium"
                                      style={{ fontSize: value, lineHeight: 1 }}
                                    >
                                      가
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  {/* ── 그라디언트 탭 ── */}
                  <TabsContent value="gradients" className="space-y-6">
                    {Object.entries(gradientGroups).map(([group, tokens]) => (
                      <div key={group}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <span className="h-px flex-1 bg-border" />
                          {group}
                          <span className="h-px flex-1 bg-border" />
                        </h3>
                        <div className="space-y-4">
                          {tokens.map(token => {
                            const value = form.gradients[token.key] || "";
                            const tokenDef = token as typeof token & { description?: string; usedIn?: string[] };
                            return (
                              <div key={token.key} className="space-y-2 p-3 rounded-lg border border-border/50 bg-card hover:border-border transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-0.5 flex-1 min-w-0">
                                    <Label className="text-xs font-semibold text-foreground">{token.label}</Label>
                                    {tokenDef.description && (
                                      <p className="text-xs text-muted-foreground leading-relaxed">{tokenDef.description}</p>
                                    )}
                                  </div>
                                  <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0 font-mono">
                                    {token.key}
                                  </code>
                                </div>
                                {tokenDef.usedIn && tokenDef.usedIn.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {tokenDef.usedIn.map((place: string) => (
                                      <span
                                        key={place}
                                        className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-primary/8 text-primary font-medium border border-primary/15"
                                      >
                                        {place}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {value && (
                                  <div
                                    className="h-12 w-full rounded-lg border border-border shadow-sm"
                                    style={{ background: value }}
                                  />
                                )}
                                <Input
                                  value={value}
                                  onChange={e => handleGradientChange(token.key, e.target.value)}
                                  placeholder="linear-gradient(135deg, #6B5FFF 0%, #9c27b0 100%)"
                                  className="font-mono text-sm"
                                />
                                <div className="flex gap-1.5 flex-wrap">
                                  {GRADIENT_PRESETS.map((preset, i) => (
                                    <button
                                      key={i}
                                      onClick={() => handleGradientChange(token.key, preset.value)}
                                      className="h-6 w-12 rounded border border-border shadow-sm hover:scale-110 transition-transform"
                                      style={{ background: preset.value }}
                                      title={preset.name}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* ── 실시간 미리보기 패널 (색상 탭에서만 우측 고정) ── */}
          {showSidePreview && (
            <div className="xl:sticky xl:top-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    실시간 사이트 미리보기
                  </CardTitle>
                  <CardDescription className="text-xs">
                    색상을 변경하면 아래 미리보기에 즉시 반영됩니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 pb-4">
                  <MuunPreview colors={form.colors} gradients={form.gradients} />
                </CardContent>
              </Card>

              {/* 색상 팔레트 요약 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">현재 색상 팔레트</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="grid grid-cols-6 gap-1.5">
                    {[
                      { key: "--primary", label: "Primary" },
                      { key: "--primary-light", label: "P.Light" },
                      { key: "--background", label: "BG" },
                      { key: "--card", label: "Card" },
                      { key: "--foreground", label: "Text" },
                      { key: "--foreground-secondary", label: "Text2" },
                      { key: "--foreground-tertiary", label: "Text3" },
                      { key: "--border", label: "Border" },
                      { key: "--muted", label: "Muted" },
                      { key: "--accent", label: "Accent" },
                      { key: "--destructive", label: "Error" },
                      { key: "--ring", label: "Ring" },
                    ].map(({ key, label }) => (
                      <div key={key} className="text-center">
                        <div
                          className="h-7 w-full rounded border border-border shadow-sm mb-0.5"
                          style={{ backgroundColor: form.colors[key] || "#ccc" }}
                          title={`${key}: ${form.colors[key]}`}
                        />
                        <span className="text-[8px] text-muted-foreground leading-none">{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 저장 버튼 */}
              <div className="space-y-2">
                <Button className="w-full gap-1.5" onClick={() => handleSave(false)} disabled={isSaving}>
                  <Save className="h-4 w-4" />
                  저장
                </Button>
                <Button variant="outline" className="w-full gap-1.5" onClick={() => handleSave(true)} disabled={isSaving}>
                  <Check className="h-4 w-4" />
                  저장 후 활성화
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// 그라디언트 빠른 선택 프리셋
const GRADIENT_PRESETS = [
  { name: "퍼플 드림", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "핑크 플레임", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "오션 블루", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "선셋", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { name: "에메랄드", value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
  { name: "미드나잇", value: "linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)" },
  { name: "골드", value: "linear-gradient(135deg, #C9A961 0%, #f5d77e 100%)" },
  { name: "무운 퍼플", value: "linear-gradient(135deg, #6B5FFF 0%, #9c27b0 100%)" },
];

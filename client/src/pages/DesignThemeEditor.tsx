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
  Palette,
  Save,
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
  const [previewVisible, setPreviewVisible] = useState(false);

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

  // 미리보기용 CSS 변수 문자열 생성
  const previewCssVars = useMemo(() => {
    const allVars = { ...form.colors, ...form.gradients };
    return Object.entries(allVars)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");
  }, [form.colors, form.gradients]);

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

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
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
              <Eye className="h-4 w-4" />
              {previewVisible ? "미리보기 닫기" : "미리보기"}
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

        <div className={`grid gap-6 ${previewVisible ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
          {/* 편집 영역 */}
          <div className={`space-y-6 ${previewVisible ? "lg:col-span-2" : ""}`}>
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

                  {/* 색상 탭 */}
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
                            return (
                              <div key={token.key} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs font-medium">{token.label}</Label>
                                  <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    {token.key}
                                  </code>
                                </div>
                                <div className="flex gap-2 items-center">
                                  {isColor && (
                                    <div className="relative">
                                      <input
                                        type="color"
                                        value={value.startsWith("#") ? value : "#6B5FFF"}
                                        onChange={e => handleColorChange(token.key, e.target.value)}
                                        className="h-9 w-9 rounded-md border border-input cursor-pointer p-0.5 bg-transparent"
                                        title="색상 선택"
                                      />
                                    </div>
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

                  {/* 타이포그래피 탭 */}
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
                            return (
                              <div key={token.key} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs font-medium">{token.label}</Label>
                                  <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    {token.key}
                                  </code>
                                </div>
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

                  {/* 그라디언트 탭 */}
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
                            return (
                              <div key={token.key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs font-medium">{token.label}</Label>
                                  <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    {token.key}
                                  </code>
                                </div>
                                {/* 그라디언트 미리보기 */}
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
                                {/* 빠른 그라디언트 프리셋 */}
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

          {/* 미리보기 패널 */}
          {previewVisible && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    실시간 미리보기
                  </CardTitle>
                  <CardDescription className="text-xs">
                    색상 변경이 즉시 반영됩니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 미리보기 컴포넌트 - 인라인 스타일로 CSS 변수 적용 */}
                  <div
                    className="rounded-xl border overflow-hidden text-sm"
                    style={{
                      // @ts-expect-error CSS custom properties
                      ...Object.fromEntries(
                        Object.entries({ ...form.colors, ...form.gradients }).map(([k, v]) => [k, v])
                      ),
                    }}
                  >
                    {/* 헤더 영역 */}
                    <div
                      className="p-4"
                      style={{ background: form.gradients["--gradient-aurora-1"] || form.colors["--primary"] }}
                    >
                      <div className="text-white font-bold text-base mb-1">무운 (MuUn)</div>
                      <div className="text-white/80 text-xs">사주 · 운세 · 꿈해몽</div>
                    </div>

                    {/* 본문 영역 */}
                    <div
                      className="p-4 space-y-3"
                      style={{ backgroundColor: form.colors["--background"] || "#f2f4f6" }}
                    >
                      {/* 카드 */}
                      <div
                        className="rounded-lg p-3 border"
                        style={{
                          backgroundColor: form.colors["--card"] || "#ffffff",
                          borderColor: form.colors["--border"] || "#e8ebed",
                        }}
                      >
                        <div
                          className="font-semibold text-sm mb-1"
                          style={{ color: form.colors["--foreground"] || "#191f28" }}
                        >
                          오늘의 운세
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: form.colors["--foreground-secondary"] || "#4e5968" }}
                        >
                          당신의 사주를 분석하여 오늘의 운세를 알려드립니다.
                        </div>
                      </div>

                      {/* 버튼 */}
                      <div className="flex gap-2">
                        <div
                          className="flex-1 rounded-lg py-2 text-center text-xs font-medium"
                          style={{
                            backgroundColor: form.colors["--primary"] || "#6B5FFF",
                            color: form.colors["--primary-foreground"] || "#ffffff",
                          }}
                        >
                          사주 보기
                        </div>
                        <div
                          className="flex-1 rounded-lg py-2 text-center text-xs font-medium border"
                          style={{
                            backgroundColor: form.colors["--secondary"] || "#f2f4f6",
                            color: form.colors["--secondary-foreground"] || "#191f28",
                            borderColor: form.colors["--border"] || "#e8ebed",
                          }}
                        >
                          꿈해몽
                        </div>
                      </div>

                      {/* 그라디언트 배너 */}
                      {form.gradients["--gradient-aurora-2"] && (
                        <div
                          className="rounded-lg p-3 text-white text-xs"
                          style={{ background: form.gradients["--gradient-aurora-2"] }}
                        >
                          <div className="font-medium mb-0.5">프리미엄 사주 분석</div>
                          <div className="opacity-80">더 깊은 운명의 흐름을 읽어드립니다</div>
                        </div>
                      )}

                      {/* 색상 팔레트 표시 */}
                      <div>
                        <div
                          className="text-xs mb-1.5"
                          style={{ color: form.colors["--foreground-tertiary"] || "#8b95a1" }}
                        >
                          적용된 색상 토큰
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {Object.entries(form.colors).slice(0, 8).map(([key, value]) => (
                            <div
                              key={key}
                              className="h-5 w-5 rounded border"
                              style={{
                                backgroundColor: value,
                                borderColor: form.colors["--border"] || "#e8ebed",
                              }}
                              title={`${key}: ${value}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 저장 버튼 */}
                  <div className="mt-4 space-y-2">
                    <Button
                      className="w-full gap-1.5"
                      onClick={() => handleSave(false)}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                      저장
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-1.5"
                      onClick={() => handleSave(true)}
                      disabled={isSaving}
                    >
                      <Check className="h-4 w-4" />
                      저장 후 활성화
                    </Button>
                  </div>
                </CardContent>
              </Card>
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

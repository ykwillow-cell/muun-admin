import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useActiveDesignTheme, useUpdateDesignTheme } from "@/lib/queries";
import { DESIGN_TOKEN_DEFINITIONS } from "@/lib/supabase";
import { Save, Type, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const FONT_FAMILY_PRESETS = [
  { name: "Noto Serif KR (기본)", value: "'Noto Serif KR', serif" },
  { name: "Noto Sans KR", value: "'Noto Sans KR', sans-serif" },
  { name: "Pretendard", value: "'Pretendard', sans-serif" },
  { name: "Gowun Dodum", value: "'Gowun Dodum', sans-serif" },
  { name: "Gowun Batang", value: "'Gowun Batang', serif" },
  { name: "Black Han Sans", value: "'Black Han Sans', sans-serif" },
];

const FONT_SIZE_PRESETS = ["10px", "11px", "12px", "13px", "14px", "16px", "18px", "20px", "22px", "24px", "28px", "32px", "36px", "40px", "45px", "57px"];

export default function DesignTypography() {
  const [, setLocation] = useLocation();
  const { data: activeTheme, isLoading } = useActiveDesignTheme();
  const updateMutation = useUpdateDesignTheme();

  const [typography, setTypography] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (activeTheme) {
      setTypography(activeTheme.typography || {});
      setHasChanges(false);
    }
  }, [activeTheme]);

  const handleChange = (key: string, value: string) => {
    setTypography(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!activeTheme) {
      toast.error("활성화된 테마가 없습니다. 먼저 테마를 활성화해 주세요.");
      return;
    }
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: activeTheme.id,
        data: { typography },
      });
      toast.success("타이포그래피 설정이 저장되었습니다.");
      setHasChanges(false);
    } catch {
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 그룹별 분류
  const groups = DESIGN_TOKEN_DEFINITIONS.typography.reduce((acc, token) => {
    if (!acc[token.group]) acc[token.group] = [];
    acc[token.group].push(token);
    return acc;
  }, {} as Record<string, typeof DESIGN_TOKEN_DEFINITIONS.typography>);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Type className="h-6 w-6 text-primary" />
              타이포그래피 관리
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              현재 활성 테마의 폰트 패밀리와 크기를 관리합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                저장되지 않은 변경사항
              </Badge>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges || !activeTheme}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              저장
            </Button>
          </div>
        </div>

        {/* 활성 테마 없음 경고 */}
        {!isLoading && !activeTheme && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-center gap-3 py-4">
              <Zap className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">활성화된 테마가 없습니다</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  타이포그래피를 편집하려면 먼저{" "}
                  <button
                    onClick={() => setLocation("/design/themes")}
                    className="underline font-medium"
                  >
                    테마 관리
                  </button>
                  에서 테마를 활성화해 주세요.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader><div className="h-5 bg-muted rounded w-1/4" /></CardHeader>
                <CardContent><div className="h-32 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* 폰트 패밀리 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">폰트 패밀리</CardTitle>
                <CardDescription>
                  사이트 전체에 적용되는 폰트를 설정합니다. Google Fonts 또는 시스템 폰트를 사용할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {groups["폰트 패밀리"]?.map(token => {
                  const value = typography[token.key] || "";
                  return (
                    <div key={token.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">{token.label}</Label>
                        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {token.key}
                        </code>
                      </div>
                      <Input
                        value={value}
                        onChange={e => handleChange(token.key, e.target.value)}
                        placeholder="'Noto Serif KR', serif"
                        className="font-mono"
                        disabled={!activeTheme}
                      />
                      {/* 폰트 프리셋 */}
                      <div className="flex gap-2 flex-wrap">
                        {FONT_FAMILY_PRESETS.map(preset => (
                          <button
                            key={preset.value}
                            onClick={() => handleChange(token.key, preset.value)}
                            disabled={!activeTheme}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all hover:bg-primary/10 hover:border-primary/40 ${
                              value === preset.value
                                ? "bg-primary/10 border-primary/40 text-primary font-medium"
                                : "bg-background border-border text-muted-foreground"
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                      {/* 폰트 미리보기 */}
                      {value && (
                        <div
                          className="p-4 rounded-lg bg-muted/50 border"
                          style={{ fontFamily: value }}
                        >
                          <p className="text-2xl font-bold mb-1">무운 (MuUn)</p>
                          <p className="text-base">사주 · 운세 · 꿈해몽 · 작명</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            The quick brown fox jumps over the lazy dog.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 폰트 크기 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">폰트 크기 스케일</CardTitle>
                <CardDescription>
                  Material Design 3 타입 스케일 기반의 폰트 크기를 설정합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Display */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="h-px flex-1 bg-border" />
                      Display
                      <span className="h-px flex-1 bg-border" />
                    </h3>
                    <div className="space-y-3">
                      {groups["크기"]?.filter(t => t.key.includes("display")).map(token => (
                        <FontSizeRow
                          key={token.key}
                          token={token}
                          value={typography[token.key] || ""}
                          onChange={val => handleChange(token.key, val)}
                          disabled={!activeTheme}
                        />
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Headline */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="h-px flex-1 bg-border" />
                      Headline
                      <span className="h-px flex-1 bg-border" />
                    </h3>
                    <div className="space-y-3">
                      {groups["크기"]?.filter(t => t.key.includes("headline")).map(token => (
                        <FontSizeRow
                          key={token.key}
                          token={token}
                          value={typography[token.key] || ""}
                          onChange={val => handleChange(token.key, val)}
                          disabled={!activeTheme}
                        />
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Title */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="h-px flex-1 bg-border" />
                      Title
                      <span className="h-px flex-1 bg-border" />
                    </h3>
                    <div className="space-y-3">
                      {groups["크기"]?.filter(t => t.key.includes("title")).map(token => (
                        <FontSizeRow
                          key={token.key}
                          token={token}
                          value={typography[token.key] || ""}
                          onChange={val => handleChange(token.key, val)}
                          disabled={!activeTheme}
                        />
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Body & Label */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="h-px flex-1 bg-border" />
                      Body & Label
                      <span className="h-px flex-1 bg-border" />
                    </h3>
                    <div className="space-y-3">
                      {groups["크기"]?.filter(t => t.key.includes("body") || t.key.includes("label")).map(token => (
                        <FontSizeRow
                          key={token.key}
                          token={token}
                          value={typography[token.key] || ""}
                          onChange={val => handleChange(token.key, val)}
                          disabled={!activeTheme}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function FontSizeRow({
  token,
  value,
  onChange,
  disabled,
}: {
  token: { key: string; label: string };
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 shrink-0">
        <Label className="text-xs font-medium">{token.label}</Label>
        <code className="text-xs text-muted-foreground block mt-0.5 truncate">{token.key}</code>
      </div>
      <div className="flex items-center gap-2 flex-1">
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="16px"
          className="font-mono text-sm w-24"
          disabled={disabled}
        />
        {/* 크기 슬라이더 */}
        <input
          type="range"
          min="8"
          max="72"
          step="1"
          value={parseInt(value) || 16}
          onChange={e => onChange(`${e.target.value}px`)}
          className="flex-1 h-1.5 accent-primary"
          disabled={disabled}
        />
        {/* 미리보기 텍스트 */}
        {value && (
          <span
            className="text-foreground font-medium shrink-0 w-12 text-right"
            style={{ fontSize: value, lineHeight: 1 }}
          >
            가Aa
          </span>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import {
  COMPONENT_TOKEN_DEFINITIONS,
  ComponentSection,
  ComponentTokens,
  ComponentTokenGroup,
  ComponentTokenDef,
  designThemeApi,
  DesignTheme,
} from "@/lib/supabase";
import { useDesignTheme, useUpdateDesignTheme } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Save,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronRight,
  Info,
  Shapes,
  MousePointerClick,
  LayoutDashboard,
  TextCursorInput,
  Tag,
  Navigation,
  PanelTop,
  RectangleHorizontal,
  Layers,
  Bell,
  ChevronDown,
  UserCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ScrollText,
  Sun,
  Moon,
  PenLine,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ColorPickerPopover } from "@/components/ColorPickerPopover";

// ── 아이콘 맵 ──
const ICON_MAP: Record<string, React.ReactNode> = {
  Shapes: <Shapes size={18} />,
  MousePointerClick: <MousePointerClick size={18} />,
  LayoutDashboard: <LayoutDashboard size={18} />,
  TextCursorInput: <TextCursorInput size={18} />,
  Tag: <Tag size={18} />,
  Navigation: <Navigation size={18} />,
  PanelTop: <PanelTop size={18} />,
  RectangleHorizontal: <RectangleHorizontal size={18} />,
  Layers: <Layers size={18} />,
  Bell: <Bell size={18} />,
  ChevronDown: <ChevronDown size={18} />,
  UserCircle: <UserCircle size={18} />,
  ScrollText: <ScrollText size={18} />,
  Sun: <Sun size={18} />,
  Moon: <Moon size={18} />,
  PenLine: <PenLine size={18} />,
  Sparkles: <Sparkles size={18} />,
};

// ── 숫자 파싱 유틸 ──
function parseNumericValue(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, "")) || 0;
}

function formatWithUnit(num: number, unit: string): string {
  return `${num}${unit}`;
}

// ── 토큰 입력 컴포넌트 ──
interface TokenInputProps {
  def: ComponentTokenDef;
  value: string;
  onChange: (key: string, value: string) => void;
}

function TokenInput({ def, value, onChange }: TokenInputProps) {
  const numVal = parseNumericValue(value);

  if (def.type === "size" || def.type === "font-size") {
    const unit = def.unit || "px";
    const min = def.min ?? 0;
    const max = def.max ?? 100;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm font-medium text-foreground">{def.label}</Label>
            {def.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={12} className="text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">{def.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              value={numVal}
              min={min}
              max={max}
              onChange={(e) =>
                onChange(def.key, formatWithUnit(parseFloat(e.target.value) || 0, unit))
              }
              className="w-20 h-7 text-xs text-right"
            />
            <span className="text-xs text-muted-foreground w-6">{unit}</span>
          </div>
        </div>
        {max <= 200 && (
          <Slider
            value={[numVal]}
            min={min}
            max={max}
            step={unit === "rem" ? 0.125 : 1}
            onValueChange={([v]) => onChange(def.key, formatWithUnit(v, unit))}
            className="w-full"
          />
        )}
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{min}{unit}</span>
          <span className="font-mono text-primary">{value}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    );
  }

  if (def.type === "font-weight") {
    const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">{def.label}</Label>
        <div className="flex flex-wrap gap-1.5">
          {weights.map((w) => (
            <button
              key={w}
              onClick={() => onChange(def.key, String(w))}
              className={cn(
                "px-2.5 py-1 rounded text-xs border transition-all",
                String(w) === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/50"
              )}
              style={{ fontWeight: w }}
            >
              {w}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground font-mono">현재: {value}</p>
      </div>
    );
  }

  if (def.type === "color") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium text-foreground">{def.label}</Label>
          {def.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={12} className="text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">{def.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ColorPickerPopover
            value={value || "#6B5FFF"}
            onChange={color => onChange(def.key, color)}
            label={def.label}
          />
          <Input
            value={value}
            onChange={(e) => onChange(def.key, e.target.value)}
            placeholder="예: rgba(107,95,255,0.2)"
            className="flex-1 h-8 text-xs font-mono"
          />
        </div>
      </div>
    );
  }

  if (def.type === "shadow") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium text-foreground">{def.label}</Label>
          {def.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={12} className="text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">{def.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(def.key, e.target.value)}
          placeholder="예: 0 4px 12px rgba(0,0,0,0.10)"
          className="h-8 text-xs font-mono"
        />
        {value && value !== "none" && (
          <div
            className="w-full h-8 rounded-md bg-card border border-border"
            style={{ boxShadow: value }}
          />
        )}
      </div>
    );
  }

  // 기본 텍스트 입력
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{def.label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(def.key, e.target.value)}
        className="h-8 text-xs font-mono"
      />
    </div>
  );
}

// ── 컴포넌트 섹션 패널 ──
interface ComponentSectionPanelProps {
  section: ComponentSection;
  tokens: ComponentTokenGroup;
  onChange: (sectionId: string, key: string, value: string) => void;
  onReset: (sectionId: string) => void;
}

function ComponentSectionPanel({
  section,
  tokens,
  onChange,
  onReset,
}: ComponentSectionPanelProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* 섹션 헤더 */}
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
              {ICON_MAP[section.icon] || <Shapes size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">{section.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
              {/* 적용 화면 태그 */}
              {section.usedIn && section.usedIn.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[10px] text-muted-foreground mr-0.5">적용:</span>
                  {section.usedIn.map((place) => (
                    <span
                      key={place}
                      className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-primary/8 text-primary font-medium border border-primary/15"
                    >
                      {place}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReset(section.id)}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 shrink-0"
          >
            <RotateCcw size={12} />
            초기화
          </Button>
        </div>
      </div>

      {/* 토큰 목록 */}
      <div className="p-5 grid grid-cols-1 gap-5">
        {section.tokens.map((def) => (
          <div key={def.key}>
            <TokenInput
              def={def}
              value={tokens[def.key] ?? ""}
              onChange={(key, value) => onChange(section.id, key, value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 실시간 미리보기 패널 ──
interface PreviewPanelProps {
  componentTokens: ComponentTokens;
  isVisible: boolean;
}

function PreviewPanel({ componentTokens, isVisible }: PreviewPanelProps) {
  if (!isVisible) return null;

  // CSS 변수 문자열 생성
  const cssVars = Object.entries(componentTokens)
    .flatMap(([, group]) =>
      group ? Object.entries(group).map(([k, v]) => `${k}: ${v};`) : []
    )
    .join("\n  ");

  return (
    <div className="sticky top-6 bg-card rounded-xl border border-border overflow-hidden">
      {/* 미리보기 헤더 */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Eye size={14} />
          실시간 미리보기
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          편집 중인 토큰이 즉시 반영됩니다
        </p>
      </div>

      {/* 미리보기 영역 */}
      <div className="p-4 space-y-6">
        <style>{`:root { ${cssVars} }`}</style>

        {/* 버튼 미리보기 */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">버튼</p>
          <div className="flex flex-wrap gap-2">
            <button
              className="bg-primary text-primary-foreground font-medium transition-all"
              style={{
                height: componentTokens.button?.["--btn-height-md"] || "40px",
                paddingLeft: componentTokens.button?.["--btn-padding-x-md"] || "16px",
                paddingRight: componentTokens.button?.["--btn-padding-x-md"] || "16px",
                borderRadius: componentTokens.button?.["--btn-radius-md"] || "10px",
                fontSize: componentTokens.button?.["--btn-font-size-md"] || "14px",
                fontWeight: componentTokens.button?.["--btn-font-weight"] || "500",
              }}
            >
              Primary
            </button>
            <button
              className="bg-secondary text-secondary-foreground border border-border font-medium transition-all"
              style={{
                height: componentTokens.button?.["--btn-height-md"] || "40px",
                paddingLeft: componentTokens.button?.["--btn-padding-x-md"] || "16px",
                paddingRight: componentTokens.button?.["--btn-padding-x-md"] || "16px",
                borderRadius: componentTokens.button?.["--btn-radius-md"] || "10px",
                fontSize: componentTokens.button?.["--btn-font-size-md"] || "14px",
                fontWeight: componentTokens.button?.["--btn-font-weight"] || "500",
              }}
            >
              Secondary
            </button>
            <button
              className="bg-transparent text-primary font-medium transition-all"
              style={{
                height: componentTokens.button?.["--btn-height-sm"] || "32px",
                paddingLeft: componentTokens.button?.["--btn-padding-x-sm"] || "12px",
                paddingRight: componentTokens.button?.["--btn-padding-x-sm"] || "12px",
                borderRadius: componentTokens.button?.["--btn-radius-sm"] || "8px",
                fontSize: componentTokens.button?.["--btn-font-size-sm"] || "13px",
              }}
            >
              Small
            </button>
          </div>
        </div>

        <Separator />

        {/* 카드 미리보기 */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">카드</p>
          <div
            className="bg-card border border-border transition-all"
            style={{
              borderRadius: componentTokens.card?.["--card-radius"] || "16px",
              padding: componentTokens.card?.["--card-padding"] || "20px",
              boxShadow: componentTokens.card?.["--card-shadow"] || "none",
              gap: componentTokens.card?.["--card-gap"] || "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="text-sm font-semibold text-foreground">카드 제목</div>
            <div className="text-xs text-muted-foreground">카드 내용 영역입니다. 패딩, 모서리, 그림자가 적용됩니다.</div>
          </div>
        </div>

        <Separator />

        {/* 인풋 미리보기 */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">인풋</p>
          <input
            type="text"
            placeholder="입력 필드 미리보기"
            className="w-full bg-input text-foreground border border-border outline-none transition-all focus:border-primary"
            style={{
              height: componentTokens.input?.["--input-height-md"] || "40px",
              paddingLeft: componentTokens.input?.["--input-padding-x"] || "12px",
              paddingRight: componentTokens.input?.["--input-padding-x"] || "12px",
              borderRadius: componentTokens.input?.["--input-radius"] || "8px",
              fontSize: componentTokens.input?.["--input-font-size"] || "14px",
              borderWidth: componentTokens.input?.["--input-border-width"] || "1px",
            }}
          />
        </div>

        <Separator />

        {/* 배지 미리보기 */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">배지</p>
          <div className="flex flex-wrap gap-2">
            {["Primary", "Secondary", "Outline"].map((label, i) => (
              <span
                key={label}
                className={cn(
                  "inline-flex items-center border transition-all",
                  i === 0 && "bg-primary text-primary-foreground border-primary",
                  i === 1 && "bg-secondary text-secondary-foreground border-secondary",
                  i === 2 && "bg-transparent text-foreground border-border",
                )}
                style={{
                  borderRadius: componentTokens.badge?.["--badge-radius"] || "9999px",
                  paddingLeft: componentTokens.badge?.["--badge-padding-x"] || "8px",
                  paddingRight: componentTokens.badge?.["--badge-padding-x"] || "8px",
                  paddingTop: componentTokens.badge?.["--badge-padding-y"] || "2px",
                  paddingBottom: componentTokens.badge?.["--badge-padding-y"] || "2px",
                  fontSize: componentTokens.badge?.["--badge-font-size"] || "11px",
                  fontWeight: componentTokens.badge?.["--badge-font-weight"] || "500",
                  borderWidth: componentTokens.badge?.["--badge-border-width"] || "1px",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <Separator />

        {/* 바텀 네비 미리보기 */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">바텀 네비게이션</p>
          <div
            className="w-full bg-card border border-border flex items-center justify-around transition-all"
            style={{
              height: componentTokens["bottom-nav"]?.["--bottom-nav-height"] || "56px",
              borderRadius: "12px",
              boxShadow: componentTokens["bottom-nav"]?.["--bottom-nav-shadow"] || "none",
            }}
          >
            {["홈", "사주", "궁합", "칼럼", "더보기"].map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <div
                  className="rounded-full transition-all"
                  style={{
                    width: componentTokens["bottom-nav"]?.["--bottom-nav-icon-size"] || "22px",
                    height: componentTokens["bottom-nav"]?.["--bottom-nav-icon-size"] || "22px",
                    backgroundColor: i === 0
                      ? (componentTokens["bottom-nav"]?.["--bottom-nav-active-color"] || "var(--primary)")
                      : (componentTokens["bottom-nav"]?.["--bottom-nav-inactive-color"] || "var(--foreground-tertiary)"),
                    opacity: 0.3,
                  }}
                />
                <span
                  className="transition-all"
                  style={{
                    fontSize: componentTokens["bottom-nav"]?.["--bottom-nav-label-size"] || "10px",
                    color: i === 0
                      ? (componentTokens["bottom-nav"]?.["--bottom-nav-active-color"] || "var(--primary)")
                      : (componentTokens["bottom-nav"]?.["--bottom-nav-inactive-color"] || "var(--foreground-tertiary)"),
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* 다이얼로그 미리보기 */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">다이얼로그</p>
          <div
            className="bg-card border border-border transition-all"
            style={{
              borderRadius: componentTokens.dialog?.["--dialog-radius"] || "20px",
              padding: componentTokens.dialog?.["--dialog-padding"] || "24px",
              boxShadow: componentTokens.dialog?.["--dialog-shadow"] || "none",
            }}
          >
            <div
              className="text-foreground mb-2"
              style={{
                fontSize: componentTokens.dialog?.["--dialog-title-size"] || "18px",
                fontWeight: componentTokens.dialog?.["--dialog-title-weight"] || "600",
              }}
            >
              다이얼로그 제목
            </div>
            <div className="text-xs text-muted-foreground">다이얼로그 내용 영역입니다.</div>
          </div>
        </div>

        <Separator />

        {/* ── 운세 결과 페이지 미리보기 ── */}
        <div className="space-y-3">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">운세 결과 페이지</p>

          {/* 사주 차트 카드 */}
          <div
            className="border transition-all overflow-hidden"
            style={{
              background: componentTokens["result-page"]?.["--result-chart-bg"] || "rgba(0,0,0,0.04)",
              borderRadius: componentTokens["result-page"]?.["--result-chart-radius"] || "16px",
              borderColor: componentTokens["result-page"]?.["--result-card-border"] || "rgba(0,0,0,0.08)",
              borderWidth: "1px",
              padding: "12px",
            }}
          >
            {/* 차트 헤더 */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: componentTokens["result-page"]?.["--result-icon-bg"] || "rgba(107,95,255,0.12)",
                  color: componentTokens["result-page"]?.["--result-accent-primary"] || "#6B5FFF",
                }}
              >
                命
              </div>
              <span className="text-xs font-semibold text-foreground">김무운님의 사주팔자</span>
            </div>

            {/* 사주 기둥 4개 */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[
                { label: "시주", hanja: "戊", sub: "무(양토)", bg: "#f5e6c8", color: "#c8860a" },
                { label: "일주", hanja: "癸", sub: "계(음수)", bg: "#dbeafe", color: "#2563eb", isMe: true },
                { label: "월주", hanja: "乙", sub: "을(음목)", bg: "#dcfce7", color: "#16a34a" },
                { label: "연주", hanja: "乙", sub: "을(음목)", bg: "#dcfce7", color: "#16a34a" },
              ].map((col, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: componentTokens["result-page"]?.["--result-label-color"] || "rgba(90,90,86,0.80)" }}
                  >
                    {col.label}
                  </span>
                  <div
                    className="w-full aspect-square rounded-lg flex items-center justify-center relative"
                    style={{ background: col.bg }}
                  >
                    {col.isMe && (
                      <span
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
                        style={{ background: componentTokens["result-page"]?.["--result-accent-primary"] || "#6B5FFF" }}
                      >
                        나
                      </span>
                    )}
                    <span className="text-base font-bold" style={{ color: col.color }}>{col.hanja}</span>
                  </div>
                  <span className="text-[8px]" style={{ color: componentTokens["result-page"]?.["--result-label-color"] || "rgba(90,90,86,0.80)" }}>
                    {col.sub}
                  </span>
                </div>
              ))}
            </div>

            {/* 간지 요약 박스 */}
            <div
              className="rounded-lg px-3 py-2 text-center transition-all"
              style={{
                background: componentTokens["result-page"]?.["--result-summary-bg"] || "rgba(234,179,8,0.10)",
              }}
            >
              <div className="text-[9px] text-muted-foreground mb-0.5">사주팔자 간지(干支)</div>
              <div className="text-[10px] font-semibold text-foreground">乙丑년 乙酉월 癸酉일 戊午시</div>
            </div>
          </div>

          {/* 결과 분석 카드 */}
          <div
            className="border transition-all"
            style={{
              background: componentTokens["result-page"]?.["--result-card-bg"] || "rgba(0,0,0,0.04)",
              borderColor: componentTokens["result-page"]?.["--result-card-border"] || "rgba(0,0,0,0.08)",
              borderWidth: "1px",
              borderRadius: componentTokens["result-page"]?.["--result-chart-radius"] || "16px",
              padding: "12px",
            }}
          >
            {/* 섹션 헤더 */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                style={{
                  background: componentTokens["result-page"]?.["--result-icon-bg"] || "rgba(107,95,255,0.12)",
                }}
              >
                ?
              </div>
              <span
                className="font-semibold transition-all"
                style={{
                  fontSize: componentTokens["result-page"]?.["--result-section-title-size"] || "18px",
                  fontWeight: componentTokens["result-page"]?.["--result-section-title-weight"] || "700",
                  color: componentTokens["result-page"]?.["--result-accent-primary"] || "#6B5FFF",
                }}
              >
                사주팔자 읽어볼까요?
              </span>
            </div>
            <p
              className="leading-relaxed transition-all"
              style={{
                fontSize: componentTokens["result-page"]?.["--result-body-size"] || "15px",
                color: "var(--foreground)",
              }}
            >
              위에 보이는 표는 <strong>만세력</strong> 또는 <strong>사주팔자</strong>라고 불러요.
            </p>
            <div className="mt-2 flex items-center gap-1">
              <span
                className="text-xs font-medium"
                style={{ color: componentTokens["result-page"]?.["--result-accent-secondary"] || "rgba(107,95,255,0.60)" }}
              >
                더 알아보기 →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 타로 결과 미리보기 ── */}
      <div className="mt-6">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">타로 결과</p>
        <div
          className="rounded-2xl p-4 border relative overflow-hidden"
          style={{
            background: componentTokens["tarot-result"]?.["--tarot-card-bg"] || "rgba(0,0,0,0.05)",
            borderColor: componentTokens["tarot-result"]?.["--tarot-card-border"] || "rgba(0,0,0,0.10)",
          }}
        >
          {/* 배경 광효 */}
          <div className="absolute top-[-20%] left-[-10%] w-32 h-32 rounded-full blur-2xl opacity-60" style={{ background: componentTokens["tarot-result"]?.["--tarot-bg-glow-1"] || "rgba(107,95,255,0.10)" }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-32 h-32 rounded-full blur-2xl opacity-60" style={{ background: componentTokens["tarot-result"]?.["--tarot-bg-glow-2"] || "rgba(147,51,234,0.10)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: componentTokens["tarot-result"]?.["--tarot-bg-glow-1"] || "rgba(107,95,255,0.15)" }}>
                <span style={{ color: componentTokens["tarot-result"]?.["--tarot-accent"] || "#6B5FFF", fontSize: "14px" }}>✦</span>
              </div>
              <span className="font-bold" style={{ fontSize: componentTokens["tarot-result"]?.["--tarot-section-title-size"] || "18px", color: componentTokens["tarot-result"]?.["--tarot-accent"] || "#6B5FFF" }}>타로 카드 결과</span>
            </div>
            <div
              className="rounded-xl p-3 border"
              style={{
                background: componentTokens["tarot-result"]?.["--tarot-result-card-bg"] || "rgba(0,0,0,0.05)",
                borderColor: componentTokens["tarot-result"]?.["--tarot-card-border"] || "rgba(0,0,0,0.10)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-14 rounded-lg bg-gradient-to-b flex items-center justify-center text-lg" style={{ background: `linear-gradient(to bottom, ${componentTokens["tarot-result"]?.["--tarot-bg-glow-1"] || "rgba(107,95,255,0.20)"}, ${componentTokens["tarot-result"]?.["--tarot-bg-glow-2"] || "rgba(147,51,234,0.20)"})` }}>🌙</div>
                <div>
                  <div className="text-xs font-bold" style={{ color: componentTokens["tarot-result"]?.["--tarot-accent"] || "#6B5FFF" }}>달 (The Moon)</div>
                  <div className="text-[10px] text-muted-foreground" style={{ fontSize: componentTokens["tarot-result"]?.["--tarot-body-size"] || "15px", fontSize: "10px" }}>직관과 무의식의 카드</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 오늘의운세 / 토정비결 결과 미리보기 ── */}
      <div className="mt-6">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">오늘의운세 / 토정비결 결과</p>
        <div
          className="rounded-2xl p-4 border"
          style={{
            background: componentTokens["daily-fortune-result"]?.["--daily-result-card-bg"] || "rgba(0,0,0,0.05)",
            borderColor: componentTokens["daily-fortune-result"]?.["--daily-result-card-border"] || "rgba(0,0,0,0.10)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: componentTokens["daily-fortune-result"]?.["--daily-icon-bg"] || "rgba(107,95,255,0.20)" }}>
              <span style={{ color: componentTokens["daily-fortune-result"]?.["--daily-accent"] || "#6B5FFF", fontSize: "14px" }}>☀</span>
            </div>
            <span className="font-bold" style={{ fontSize: componentTokens["daily-fortune-result"]?.["--daily-section-title-size"] || "18px", color: componentTokens["daily-fortune-result"]?.["--daily-accent"] || "#6B5FFF" }}>오늘의 운세</span>
          </div>
          <div
            className="rounded-xl p-3 border"
            style={{
              background: `linear-gradient(135deg, ${componentTokens["daily-fortune-result"]?.["--daily-gradient-from"] || "rgba(107,95,255,0.10)"}, ${componentTokens["daily-fortune-result"]?.["--daily-gradient-to"] || "rgba(147,51,234,0.10)"})`,
              borderColor: componentTokens["daily-fortune-result"]?.["--daily-result-card-border"] || "rgba(0,0,0,0.10)",
            }}
          >
            <p className="text-xs" style={{ fontSize: componentTokens["daily-fortune-result"]?.["--daily-body-size"] || "15px", fontSize: "11px" }}>재물운이 열리는 날. 막혔던 흐름이 풀리는 시기입니다.</p>
          </div>
        </div>
      </div>

      {/* ── 작명 결과 미리보기 ── */}
      <div className="mt-6">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">작명 결과</p>
        <div className="space-y-2">
          {/* 선택된 이름 카드 */}
          <div
            className="rounded-xl p-3 border flex items-center justify-between"
            style={{
              background: componentTokens["naming-result"]?.["--naming-selected-bg"] || "rgba(107,95,255,0.10)",
              borderColor: componentTokens["naming-result"]?.["--naming-selected-border"] || "rgba(107,95,255,0.40)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm" style={{ color: componentTokens["naming-result"]?.["--naming-accent"] || "#6B5FFF" }}>김무운</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: componentTokens["naming-result"]?.["--naming-gil-bg"] || "rgba(107,95,255,0.08)", color: componentTokens["naming-result"]?.["--naming-gil-color"] || "#6B5FFF" }}>길(吉)</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: componentTokens["naming-result"]?.["--naming-score-high-bg"] || "rgba(16,185,129,0.20)", color: componentTokens["naming-result"]?.["--naming-score-high-color"] || "#059669" }}>95점</span>
          </div>
          {/* 일반 이름 카드 */}
          <div
            className="rounded-xl p-3 border flex items-center justify-between"
            style={{
              background: componentTokens["naming-result"]?.["--naming-card-bg"] || "rgba(0,0,0,0.05)",
              borderColor: componentTokens["naming-result"]?.["--naming-card-border"] || "rgba(0,0,0,0.10)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">김운세</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: componentTokens["naming-result"]?.["--naming-흉-bg"] || "rgba(239,68,68,0.08)", color: componentTokens["naming-result"]?.["--naming-흉-color"] || "#dc2626" }}>흉(凶)</span>
            </div>
            <span className="text-[10px] text-muted-foreground">72점</span>
          </div>
        </div>
      </div>

      {/* ── 꿈해몽 결과 미리보기 ── */}
      <div className="mt-6">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">꿈해몽 결과</p>
        <div
          className="rounded-2xl p-4 border"
          style={{
            background: componentTokens["dream-result"]?.["--dream-result-card-bg"] || "rgba(0,0,0,0.05)",
            borderColor: componentTokens["dream-result"]?.["--dream-result-card-border"] || "rgba(0,0,0,0.10)",
          }}
        >
          <div className="flex gap-2 mb-3">
            <div className="px-2 py-1 rounded-full text-[10px] font-medium" style={{ background: componentTokens["dream-result"]?.["--dream-category-animal-bg"] || "rgba(251,146,60,0.10)", color: "#f97316" }}>동물</div>
            <div className="px-2 py-1 rounded-full text-[10px] font-medium" style={{ background: componentTokens["dream-result"]?.["--dream-category-nature-bg"] || "rgba(74,222,128,0.10)", color: "#22c55e" }}>자연</div>
          </div>
          <p className="text-xs" style={{ fontSize: componentTokens["dream-result"]?.["--dream-body-size"] || "15px", fontSize: "11px", color: componentTokens["dream-result"]?.["--dream-accent"] || "#6B5FFF" }}>호랑이 꿈 해석 결과</p>
          <p className="text-[10px] text-muted-foreground mt-1">강한 에너지와 리더십을 상징합니다.</p>
        </div>
      </div>

      {/* ── 기타 서비스 결과 미리보기 ── */}
      <div className="mt-6">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">행운의 점심메뉴 / 심리테스트</p>
        <div className="space-y-2">
          {/* 점심메뉴 카드 */}
          <div
            className="rounded-xl p-3 border"
            style={{
              background: componentTokens["misc-result"]?.["--lunch-card-bg"] || "rgba(245,158,11,0.05)",
              borderColor: `${componentTokens["misc-result"]?.["--lunch-accent"] || "rgba(245,158,11,1)"}33`,
            }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: componentTokens["misc-result"]?.["--lunch-accent"] || "rgba(245,158,11,1)", fontSize: "18px" }}>🍱</span>
              <div>
                <div className="text-xs font-bold" style={{ color: componentTokens["misc-result"]?.["--lunch-accent"] || "rgba(245,158,11,1)" }}>오늘의 추천 메뉴</div>
                <div className="text-[10px] text-muted-foreground">비빔밥 — 오행 균형 최적</div>
              </div>
            </div>
          </div>
          {/* 심리테스트 결과 카드 */}
          <div
            className="rounded-xl p-3 border"
            style={{
              background: componentTokens["misc-result"]?.["--misc-result-card-bg"] || "rgba(0,0,0,0.05)",
              borderColor: componentTokens["misc-result"]?.["--misc-result-card-border"] || "rgba(0,0,0,0.10)",
            }}
          >
            <div className="text-xs font-bold mb-1" style={{ color: componentTokens["misc-result"]?.["--psychology-accent"] || "#6B5FFF" }}>심리테스트 결과</div>
            <p className="text-[10px] text-muted-foreground" style={{ fontSize: componentTokens["misc-result"]?.["--misc-body-size"] || "15px", fontSize: "10px" }}>당신은 직관형 리더입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 기본 컴포넌트 토큰 (리셋용) ──
const DEFAULT_COMPONENT_TOKENS: ComponentTokens = {
  global: {
    "--radius": "1rem",
    "--radius-sm": "0.75rem",
    "--radius-md": "0.875rem",
    "--radius-lg": "1rem",
    "--radius-xl": "1.25rem",
    "--radius-full": "9999px",
  },
  button: {
    "--btn-height-xs": "28px",
    "--btn-height-sm": "32px",
    "--btn-height-md": "40px",
    "--btn-height-lg": "48px",
    "--btn-height-xl": "56px",
    "--btn-padding-x-xs": "8px",
    "--btn-padding-x-sm": "12px",
    "--btn-padding-x-md": "16px",
    "--btn-padding-x-lg": "20px",
    "--btn-padding-x-xl": "24px",
    "--btn-radius-xs": "6px",
    "--btn-radius-sm": "8px",
    "--btn-radius-md": "10px",
    "--btn-radius-lg": "12px",
    "--btn-radius-xl": "14px",
    "--btn-font-size-sm": "13px",
    "--btn-font-size-md": "14px",
    "--btn-font-size-lg": "16px",
    "--btn-font-weight": "500",
    "--btn-gap-sm": "4px",
    "--btn-gap-md": "6px",
    "--btn-gap-lg": "8px",
    "--btn-transition": "all 0.15s ease",
  },
  card: {
    "--card-radius": "16px",
    "--card-padding": "20px",
    "--card-padding-sm": "16px",
    "--card-padding-lg": "24px",
    "--card-border-width": "1px",
    "--card-border-color": "var(--border)",
    "--card-shadow": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    "--card-shadow-hover": "0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)",
    "--card-gap": "16px",
  },
  input: {
    "--input-height-sm": "32px",
    "--input-height-md": "40px",
    "--input-height-lg": "48px",
    "--input-padding-x": "12px",
    "--input-padding-y": "8px",
    "--input-radius": "8px",
    "--input-border-width": "1px",
    "--input-border-color": "var(--border)",
    "--input-border-color-focus": "var(--primary)",
    "--input-font-size": "14px",
    "--input-line-height": "1.5",
    "--input-ring-width": "3px",
    "--input-ring-color": "rgba(107,95,255,0.2)",
  },
  badge: {
    "--badge-radius": "9999px",
    "--badge-padding-x": "8px",
    "--badge-padding-y": "2px",
    "--badge-font-size": "11px",
    "--badge-font-weight": "500",
    "--badge-border-width": "1px",
    "--badge-gap": "4px",
  },
  "bottom-nav": {
    "--bottom-nav-height": "56px",
    "--bottom-nav-bg": "var(--card)",
    "--bottom-nav-border-top": "1px solid var(--border)",
    "--bottom-nav-shadow": "0 -2px 12px rgba(0,0,0,0.06)",
    "--bottom-nav-icon-size": "22px",
    "--bottom-nav-label-size": "10px",
    "--bottom-nav-active-color": "var(--primary)",
    "--bottom-nav-inactive-color": "var(--foreground-tertiary)",
    "--bottom-nav-dot-size": "4px",
    "--bottom-nav-dot-color": "var(--primary)",
  },
  gnb: {
    "--gnb-height": "56px",
    "--gnb-bg": "var(--card)",
    "--gnb-border-bottom": "1px solid var(--border)",
    "--gnb-shadow": "none",
    "--gnb-title-size": "17px",
    "--gnb-title-weight": "600",
    "--gnb-icon-size": "24px",
    "--gnb-padding-x": "16px",
  },
  dialog: {
    "--dialog-radius": "20px",
    "--dialog-padding": "24px",
    "--dialog-shadow": "0 20px 60px rgba(0,0,0,0.20)",
    "--dialog-overlay-bg": "rgba(0,0,0,0.5)",
    "--dialog-max-width": "480px",
    "--dialog-title-size": "18px",
    "--dialog-title-weight": "600",
  },
  tabs: {
    "--tabs-list-bg": "var(--muted)",
    "--tabs-list-radius": "10px",
    "--tabs-list-padding": "4px",
    "--tabs-trigger-radius": "8px",
    "--tabs-trigger-height": "32px",
    "--tabs-trigger-padding-x": "12px",
    "--tabs-trigger-font-size": "13px",
    "--tabs-trigger-font-weight": "500",
    "--tabs-active-bg": "var(--card)",
    "--tabs-active-shadow": "0 1px 3px rgba(0,0,0,0.10)",
    "--tabs-active-color": "var(--foreground)",
    "--tabs-inactive-color": "var(--foreground-secondary)",
  },
  toast: {
    "--toast-radius": "12px",
    "--toast-padding-x": "16px",
    "--toast-padding-y": "12px",
    "--toast-shadow": "0 4px 16px rgba(0,0,0,0.12)",
    "--toast-font-size": "14px",
    "--toast-font-weight": "500",
    "--toast-border-width": "1px",
  },
  select: {
    "--select-trigger-height": "40px",
    "--select-trigger-radius": "8px",
    "--select-trigger-padding-x": "12px",
    "--select-trigger-border-width": "1px",
    "--select-content-radius": "10px",
    "--select-content-shadow": "0 4px 16px rgba(0,0,0,0.12)",
    "--select-item-height": "36px",
    "--select-item-padding-x": "12px",
    "--select-item-radius": "6px",
    "--select-item-font-size": "14px",
  },
  avatar: {
    "--avatar-size-xs": "24px",
    "--avatar-size-sm": "32px",
    "--avatar-size-md": "40px",
    "--avatar-size-lg": "48px",
    "--avatar-size-xl": "64px",
    "--avatar-radius": "9999px",
    "--avatar-border-width": "2px",
    "--avatar-border-color": "var(--card)",
  },
  "result-page": {
    "--result-chart-bg": "rgba(0,0,0,0.04)",
    "--result-chart-radius": "16px",
    "--result-summary-bg": "rgba(234,179,8,0.10)",
    "--result-card-bg": "rgba(0,0,0,0.04)",
    "--result-card-border": "rgba(0,0,0,0.08)",
    "--result-icon-bg": "rgba(107,95,255,0.12)",
    "--result-accent-primary": "var(--primary, #6B5FFF)",
    "--result-accent-secondary": "rgba(107,95,255,0.60)",
    "--result-section-title-size": "18px",
    "--result-section-title-weight": "700",
    "--result-body-size": "15px",
    "--result-label-color": "rgba(90,90,86,0.80)",
  },
  "tarot-result": {
    "--tarot-card-bg": "rgba(0,0,0,0.05)",
    "--tarot-card-border": "rgba(0,0,0,0.10)",
    "--tarot-accent": "var(--primary, #6B5FFF)",
    "--tarot-bg-glow-1": "rgba(107,95,255,0.10)",
    "--tarot-bg-glow-2": "rgba(147,51,234,0.10)",
    "--tarot-result-card-bg": "rgba(0,0,0,0.05)",
    "--tarot-section-title-size": "18px",
    "--tarot-body-size": "15px",
  },
  "daily-fortune-result": {
    "--daily-result-card-bg": "rgba(0,0,0,0.05)",
    "--daily-result-card-border": "rgba(0,0,0,0.10)",
    "--daily-accent": "var(--primary, #6B5FFF)",
    "--daily-icon-bg": "rgba(107,95,255,0.20)",
    "--daily-gradient-from": "rgba(107,95,255,0.10)",
    "--daily-gradient-to": "rgba(147,51,234,0.10)",
    "--daily-section-title-size": "18px",
    "--daily-body-size": "15px",
  },
  "naming-result": {
    "--naming-card-bg": "rgba(0,0,0,0.05)",
    "--naming-card-border": "rgba(0,0,0,0.10)",
    "--naming-selected-bg": "rgba(107,95,255,0.10)",
    "--naming-selected-border": "rgba(107,95,255,0.40)",
    "--naming-gil-bg": "rgba(107,95,255,0.08)",
    "--naming-gil-color": "#6B5FFF",
    "--naming-흉-bg": "rgba(239,68,68,0.08)",
    "--naming-흉-color": "#dc2626",
    "--naming-score-high-bg": "rgba(16,185,129,0.20)",
    "--naming-score-high-color": "#059669",
    "--naming-accent": "var(--primary, #6B5FFF)",
  },
  "dream-result": {
    "--dream-result-card-bg": "rgba(0,0,0,0.05)",
    "--dream-result-card-border": "rgba(0,0,0,0.10)",
    "--dream-accent": "var(--primary, #6B5FFF)",
    "--dream-hero-from": "rgba(147,51,234,0.10)",
    "--dream-category-animal-bg": "rgba(251,146,60,0.10)",
    "--dream-category-nature-bg": "rgba(74,222,128,0.10)",
    "--dream-body-size": "15px",
  },
  "misc-result": {
    "--misc-result-card-bg": "rgba(0,0,0,0.05)",
    "--misc-result-card-border": "rgba(0,0,0,0.10)",
    "--misc-accent": "var(--primary, #6B5FFF)",
    "--lunch-accent": "rgba(245,158,11,1)",
    "--lunch-card-bg": "rgba(245,158,11,0.05)",
    "--psychology-accent": "var(--primary, #6B5FFF)",
    "--misc-body-size": "15px",
  },
};

// ── 메인 페이지 컴포넌트 ──
export default function DesignComponentEditor() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: theme, isLoading, error } = useDesignTheme(id!);
  const updateMutation = useUpdateDesignTheme();

  const [componentTokens, setComponentTokens] = useState<ComponentTokens>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // 테마 데이터 로드 시 컴포넌트 토큰 초기화
  useEffect(() => {
    if (theme) {
      const loaded = theme.component_tokens || {};
      // 기본값과 병합 (누락된 토큰 보완)
      const merged: ComponentTokens = {};
      for (const section of COMPONENT_TOKEN_DEFINITIONS) {
        const sectionId = section.id as keyof ComponentTokens;
        const defaultGroup = DEFAULT_COMPONENT_TOKENS[sectionId] || {};
        const loadedGroup = (loaded as ComponentTokens)[sectionId] || {};
        merged[sectionId] = { ...defaultGroup, ...loadedGroup };
      }
      setComponentTokens(merged);
      setIsDirty(false);
    }
  }, [theme]);

  // 토큰 변경 핸들러
  const handleTokenChange = useCallback(
    (sectionId: string, key: string, value: string) => {
      setComponentTokens((prev) => ({
        ...prev,
        [sectionId]: {
          ...(prev[sectionId] || {}),
          [key]: value,
        },
      }));
      setIsDirty(true);
      setIsSaved(false);
    },
    []
  );

  // 섹션 초기화
  const handleResetSection = useCallback((sectionId: string) => {
    const defaultGroup = DEFAULT_COMPONENT_TOKENS[sectionId as keyof ComponentTokens];
    if (!defaultGroup) return;
    setComponentTokens((prev) => ({
      ...prev,
      [sectionId]: { ...defaultGroup },
    }));
    setIsDirty(true);
    setIsSaved(false);
    toast.info(`${COMPONENT_TOKEN_DEFINITIONS.find(s => s.id === sectionId)?.label} 초기화 완료`);
  }, []);

  // 저장
  const handleSave = async () => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        data: { component_tokens: componentTokens },
      });
      setIsDirty(false);
      setIsSaved(true);
      toast.success("컴포넌트 토큰이 저장되었습니다.");
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      toast.error("저장에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">테마를 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => navigate("/design/themes")}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  // 활성 섹션 필터링
  const visibleSections = activeSection
    ? COMPONENT_TOKEN_DEFINITIONS.filter((s) => s.id === activeSection)
    : COMPONENT_TOKEN_DEFINITIONS;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/design/themes/${id}/edit`)}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} />
            테마 편집기로
          </Button>
          <div className="w-px h-5 bg-border" />
          <div>
            <h1 className="text-xl font-bold text-foreground">컴포넌트 토큰 편집기</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-medium text-foreground">{theme.name}</span> 테마의 컴포넌트 디자인 설정
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
              미저장 변경사항
            </Badge>
          )}
          {isSaved && (
            <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 gap-1">
              <CheckCircle2 size={12} />
              저장됨
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-8 gap-1.5"
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? "미리보기 숨기기" : "미리보기 보기"}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || updateMutation.isPending}
            className="h-8 gap-1.5"
          >
            {updateMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            저장
          </Button>
        </div>
      </div>

      {/* 컴포넌트 섹션 필터 탭 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveSection(null)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
            activeSection === null
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
          )}
        >
          전체 보기
        </button>
        {COMPONENT_TOKEN_DEFINITIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id === activeSection ? null : section.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
              activeSection === section.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
          >
            {ICON_MAP[section.icon] && (
              <span className="scale-75">{ICON_MAP[section.icon]}</span>
            )}
            {section.label}
          </button>
        ))}
      </div>

      {/* 메인 레이아웃 */}
      <div className={cn(
        "grid gap-6",
        showPreview ? "grid-cols-1 lg:grid-cols-[1fr_320px]" : "grid-cols-1"
      )}>
        {/* 편집기 영역 */}
        <div className="space-y-4">
          {visibleSections.map((section) => (
            <ComponentSectionPanel
              key={section.id}
              section={section}
              tokens={componentTokens[section.id as keyof ComponentTokens] || {}}
              onChange={handleTokenChange}
              onReset={handleResetSection}
            />
          ))}
        </div>

        {/* 미리보기 패널 */}
        {showPreview && (
          <PreviewPanel
            componentTokens={componentTokens}
            isVisible={showPreview}
          />
        )}
      </div>
    </div>
  );
}

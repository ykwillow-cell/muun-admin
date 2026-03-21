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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
          {value.startsWith("#") && (
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(def.key, e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
          )}
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
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {ICON_MAP[section.icon] || <Shapes size={18} />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{section.label}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReset(section.id)}
          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <RotateCcw size={12} />
          초기화
        </Button>
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

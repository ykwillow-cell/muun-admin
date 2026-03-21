import { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColorPickerPopover } from "@/components/ColorPickerPopover";
import { Plus, Trash2, RotateCcw } from "lucide-react";

// ─── 타입 ────────────────────────────────────────────────────────────────

interface GradientStop {
  id: string;
  color: string;
  position: number; // 0~100
}

interface GradientState {
  type: "linear" | "radial";
  angle: number; // linear 전용
  stops: GradientStop[];
}

// ─── 유틸 ────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

/** GradientState → CSS 문자열 */
function toCss(g: GradientState): string {
  const sorted = [...g.stops].sort((a, b) => a.position - b.position);
  const stops = sorted.map(s => `${s.color} ${s.position}%`).join(", ");
  if (g.type === "radial") return `radial-gradient(circle, ${stops})`;
  return `linear-gradient(${g.angle}deg, ${stops})`;
}

/** CSS 문자열 → GradientState (파싱) */
function fromCss(css: string): GradientState {
  const defaultState: GradientState = {
    type: "linear",
    angle: 135,
    stops: [
      { id: uid(), color: "#6B5FFF", position: 0 },
      { id: uid(), color: "#60C8D4", position: 100 },
    ],
  };

  if (!css) return defaultState;

  const isRadial = css.trim().startsWith("radial-gradient");
  const inner = css.match(/gradient\((.+)\)$/s)?.[1];
  if (!inner) return defaultState;

  let angle = 135;
  let stopsStr = inner;

  if (!isRadial) {
    // 각도 파싱
    const angleMatch = inner.match(/^(\d+)deg\s*,\s*/);
    if (angleMatch) {
      angle = parseInt(angleMatch[1]);
      stopsStr = inner.slice(angleMatch[0].length);
    }
    // "to right" 등
    const dirMatch = inner.match(/^to\s+\w+(?:\s+\w+)?\s*,\s*/);
    if (dirMatch) {
      stopsStr = inner.slice(dirMatch[0].length);
    }
  } else {
    // radial: "circle, ..." 제거
    stopsStr = inner.replace(/^circle\s*,\s*/, "");
  }

  // 스톱 파싱: "color position%" 형태
  const stopRegex = /((?:#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|\w+))\s+([\d.]+)%/g;
  const stops: GradientStop[] = [];
  let m: RegExpExecArray | null;
  while ((m = stopRegex.exec(stopsStr)) !== null) {
    stops.push({ id: uid(), color: m[1], position: parseFloat(m[2]) });
  }

  if (stops.length < 2) return defaultState;
  return { type: isRadial ? "radial" : "linear", angle, stops };
}

// ─── 프리셋 ───────────────────────────────────────────────────────────────

const GRADIENT_PRESETS = [
  { name: "무운 퍼플", value: "linear-gradient(135deg, #6B5FFF 0%, #9c27b0 100%)" },
  { name: "미드나잇", value: "linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)" },
  { name: "오로라", value: "linear-gradient(135deg, #6B5FFF 0%, #60C8D4 60%, #A8E6CF 100%)" },
  { name: "퍼플 드림", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "오션 블루", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "핑크 플레임", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "선셋", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { name: "에메랄드", value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
  { name: "골드", value: "linear-gradient(135deg, #C9A961 0%, #f5d77e 100%)" },
  { name: "딥 나이트", value: "linear-gradient(155deg, #12082e 0%, #1e0f4a 100%)" },
  { name: "로즈 골드", value: "linear-gradient(135deg, #f43f5e 0%, #C9A961 100%)" },
  { name: "라디얼 퍼플", value: "radial-gradient(circle, #8B7FFF 0%, #0c3483 100%)" },
];

// ─── 방향 프리셋 버튼 ─────────────────────────────────────────────────────

const ANGLE_PRESETS = [
  { label: "↓", angle: 180 },
  { label: "↗", angle: 45 },
  { label: "→", angle: 90 },
  { label: "↘", angle: 135 },
  { label: "↑", angle: 0 },
  { label: "↙", angle: 225 },
  { label: "←", angle: 270 },
  { label: "↖", angle: 315 },
];

// ─── 스톱 드래그 슬라이더 ─────────────────────────────────────────────────

function StopSlider({
  stops,
  selectedId,
  onSelect,
  onMove,
  gradientCss,
}: {
  stops: GradientStop[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, pos: number) => void;
  gradientCss: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<string | null>(null);

  const getPos = (e: MouseEvent | TouchEvent) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const pos = getPos(e);
      onMove(dragging.current, Math.round(pos));
    };
    const onUp = () => { dragging.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [onMove]);

  return (
    <div
      ref={trackRef}
      className="relative h-8 rounded-md border border-border cursor-crosshair"
      style={{
        background: `${gradientCss}, repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 8px 8px`,
        backgroundBlendMode: "normal, normal",
      }}
    >
      {/* 그라디언트 오버레이 */}
      <div
        className="absolute inset-0 rounded-md"
        style={{ background: gradientCss }}
      />
      {/* 스톱 핸들 */}
      {stops.map(stop => (
        <div
          key={stop.id}
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-5 rounded-sm border-2 cursor-grab shadow-md transition-shadow ${
            selectedId === stop.id
              ? "border-white ring-2 ring-primary shadow-lg z-10"
              : "border-white z-0"
          }`}
          style={{
            left: `calc(${stop.position}% - 8px)`,
            backgroundColor: stop.color,
          }}
          onMouseDown={e => {
            e.stopPropagation();
            dragging.current = stop.id;
            onSelect(stop.id);
          }}
          onTouchStart={e => {
            e.stopPropagation();
            dragging.current = stop.id;
            onSelect(stop.id);
          }}
        />
      ))}
    </div>
  );
}

// ─── 메인 GradientPickerPopover ───────────────────────────────────────────

interface GradientPickerPopoverProps {
  value: string;
  onChange: (value: string) => void;
}

export function GradientPickerPopover({ value, onChange }: GradientPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<GradientState>(() => fromCss(value));
  const [selectedStopId, setSelectedStopId] = useState<string | null>(
    () => fromCss(value).stops[0]?.id ?? null
  );

  // 외부 value 변경 시 동기화
  useEffect(() => {
    const parsed = fromCss(value);
    setState(parsed);
    setSelectedStopId(parsed.stops[0]?.id ?? null);
  }, [value]);

  const emit = (next: GradientState) => {
    setState(next);
    onChange(toCss(next));
  };

  const selectedStop = state.stops.find(s => s.id === selectedStopId) ?? state.stops[0];

  const updateStop = (id: string, patch: Partial<GradientStop>) => {
    emit({
      ...state,
      stops: state.stops.map(s => s.id === id ? { ...s, ...patch } : s),
    });
  };

  const addStop = () => {
    const sorted = [...state.stops].sort((a, b) => a.position - b.position);
    // 가장 긴 간격 중간에 추가
    let bestPos = 50;
    let bestGap = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].position - sorted[i].position;
      if (gap > bestGap) {
        bestGap = gap;
        bestPos = Math.round((sorted[i].position + sorted[i + 1].position) / 2);
      }
    }
    const newStop: GradientStop = { id: uid(), color: "#ffffff", position: bestPos };
    const next = { ...state, stops: [...state.stops, newStop] };
    emit(next);
    setSelectedStopId(newStop.id);
  };

  const removeStop = (id: string) => {
    if (state.stops.length <= 2) return;
    const next = { ...state, stops: state.stops.filter(s => s.id !== id) };
    emit(next);
    setSelectedStopId(next.stops[0].id);
  };

  const css = toCss(state);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-9 w-full rounded-md border border-input shadow-sm hover:opacity-90 transition-opacity overflow-hidden"
          title={value}
          style={{ background: value || "#ccc" }}
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-4 space-y-4"
        align="start"
        sideOffset={6}
        onOpenAutoFocus={e => e.preventDefault()}
      >
        {/* 미리보기 */}
        <div
          className="h-14 w-full rounded-lg border border-border shadow-inner"
          style={{ background: css }}
        />

        {/* 타입 선택 */}
        <div className="flex gap-2">
          {(["linear", "radial"] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => emit({ ...state, type: t })}
              className={`flex-1 h-7 rounded text-xs font-medium border transition-colors ${
                state.type === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {t === "linear" ? "선형" : "방사형"}
            </button>
          ))}
        </div>

        {/* 각도 (linear 전용) */}
        {state.type === "linear" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">방향 / 각도</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={360}
                  value={state.angle}
                  onChange={e => emit({ ...state, angle: Number(e.target.value) % 360 })}
                  className="h-6 w-16 text-xs font-mono px-2"
                />
                <span className="text-xs text-muted-foreground">°</span>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {ANGLE_PRESETS.map(({ label, angle }) => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => emit({ ...state, angle })}
                  className={`h-7 rounded text-sm border transition-colors ${
                    state.angle === angle
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:bg-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 색상 스톱 슬라이더 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">색상 스톱</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs gap-1"
              onClick={addStop}
            >
              <Plus className="h-3 w-3" />
              추가
            </Button>
          </div>
          <StopSlider
            stops={state.stops}
            selectedId={selectedStopId}
            gradientCss={css}
            onSelect={id => setSelectedStopId(id)}
            onMove={(id, pos) => updateStop(id, { position: pos })}
          />
        </div>

        {/* 선택된 스톱 편집 */}
        {selectedStop && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
            <ColorPickerPopover
              value={selectedStop.color}
              onChange={color => updateStop(selectedStop.id, { color })}
              label="스톱 색상"
            />
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={selectedStop.position}
                  onChange={e => updateStop(selectedStop.id, { position: Math.max(0, Math.min(100, Number(e.target.value))) })}
                  className="h-7 w-16 text-xs font-mono px-2"
                />
                <span className="text-xs text-muted-foreground">%</span>
                <code className="text-[10px] font-mono text-muted-foreground truncate flex-1 bg-muted px-1.5 py-0.5 rounded">
                  {selectedStop.color}
                </code>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={() => removeStop(selectedStop.id)}
              disabled={state.stops.length <= 2}
              title="스톱 삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* 스톱 목록 */}
        <div className="space-y-1">
          {[...state.stops]
            .sort((a, b) => a.position - b.position)
            .map(stop => (
              <button
                key={stop.id}
                type="button"
                onClick={() => setSelectedStopId(stop.id)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
                  selectedStopId === stop.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted border border-transparent"
                }`}
              >
                <div
                  className="h-4 w-4 rounded border border-border shrink-0"
                  style={{ backgroundColor: stop.color }}
                />
                <span className="font-mono text-muted-foreground">{stop.color}</span>
                <span className="ml-auto text-muted-foreground">{stop.position}%</span>
              </button>
            ))}
        </div>

        {/* 프리셋 */}
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground">프리셋</Label>
          <div className="grid grid-cols-6 gap-1">
            {GRADIENT_PRESETS.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  const parsed = fromCss(preset.value);
                  setState(parsed);
                  setSelectedStopId(parsed.stops[0]?.id ?? null);
                  onChange(preset.value);
                }}
                className="h-7 rounded border border-border shadow-sm hover:scale-110 transition-transform"
                style={{ background: preset.value }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* CSS 값 표시 + 초기화 */}
        <div className="flex items-center gap-1.5 bg-muted rounded px-2 py-1.5">
          <code className="text-[10px] font-mono text-muted-foreground truncate flex-1">
            {css}
          </code>
          <button
            type="button"
            onClick={() => {
              const def = fromCss("linear-gradient(135deg, #6B5FFF 0%, #60C8D4 100%)");
              setState(def);
              setSelectedStopId(def.stops[0].id);
              onChange(toCss(def));
            }}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            title="초기화"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

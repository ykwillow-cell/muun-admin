import { useCallback, useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Pipette } from "lucide-react";

// ─── 유틸: 색상 파싱 / 변환 ────────────────────────────────────────────────

/** hex → { r, g, b } */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6 || clean.length === 8) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }
  return null;
}

/** { r, g, b } → hex */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** rgba(r,g,b,a) 문자열 파싱 → { r, g, b, a } */
function parseRgba(value: string): { r: number; g: number; b: number; a: number } | null {
  const m = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return {
    r: parseInt(m[1]),
    g: parseInt(m[2]),
    b: parseInt(m[3]),
    a: m[4] !== undefined ? parseFloat(m[4]) : 1,
  };
}

/** CSS 색상 문자열 → { r, g, b, a } */
function parseColor(value: string): { r: number; g: number; b: number; a: number } {
  const rgba = parseRgba(value);
  if (rgba) return rgba;
  const rgb = hexToRgb(value);
  if (rgb) return { ...rgb, a: 1 };
  return { r: 107, g: 95, b: 255, a: 1 }; // fallback: 무운 퍼플
}

/** { r, g, b, a } → CSS 문자열 */
function toColorString(r: number, g: number, b: number, a: number): string {
  if (a >= 1) return rgbToHex(r, g, b);
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${parseFloat(a.toFixed(2))})`;
}

/** { r, g, b } → { h(0-360), s(0-1), v(0-1) } */
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = ((h * 60) + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

/** { h(0-360), s(0-1), v(0-1) } → { r, g, b } */
function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// ─── 브랜드 팔레트 스와치 ──────────────────────────────────────────────────

const PALETTE_SWATCHES = [
  // 무운 브랜드
  "#6B5FFF", "#8B7FFF", "#9c27b0", "#4f46e5",
  // 블루 계열
  "#0c3483", "#1a237e", "#1e40af", "#0284c7",
  // 청록
  "#0891b2", "#14b8a6", "#10b981", "#60C8D4",
  // 그린
  "#6b8e23", "#22c55e", "#A8E6CF", "#84cc16",
  // 레드/핑크
  "#c41e3a", "#dc2626", "#f43f5e", "#ff6b6b",
  // 오렌지/옐로
  "#f97316", "#f59e0b", "#C9A961", "#eab308",
  // 뉴트럴
  "#191f28", "#2d3748", "#4e5968", "#718096",
  "#8b95a1", "#e8ebed", "#f2f4f6", "#ffffff",
];

// ─── 색상 스펙트럼 캔버스 피커 ────────────────────────────────────────────

interface SpectrumProps {
  hue: number;
  saturation: number;
  value: number;
  onChange: (s: number, v: number) => void;
}

function SpectrumCanvas({ hue, saturation, value, onChange }: SpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;

    // 흰색 → 순색 가로 그라디언트
    const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0, "rgba(255,255,255,1)");
    whiteGrad.addColorStop(1, `hsl(${hue},100%,50%)`);
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);

    // 검정 세로 그라디언트
    const blackGrad = ctx.createLinearGradient(0, 0, 0, height);
    blackGrad.addColorStop(0, "rgba(0,0,0,0)");
    blackGrad.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  useEffect(() => { draw(); }, [draw]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    onChange(x, 1 - y);
  };

  return (
    <div className="relative select-none">
      <canvas
        ref={canvasRef}
        width={240}
        height={140}
        className="w-full rounded-md cursor-crosshair"
        style={{ touchAction: "none" }}
        onMouseDown={e => { isDragging.current = true; getPos(e); }}
        onMouseMove={e => { if (isDragging.current) getPos(e); }}
        onMouseUp={() => { isDragging.current = false; }}
        onMouseLeave={() => { isDragging.current = false; }}
        onTouchStart={e => { isDragging.current = true; getPos(e); }}
        onTouchMove={e => { if (isDragging.current) getPos(e); }}
        onTouchEnd={() => { isDragging.current = false; }}
      />
      {/* 커서 */}
      <div
        className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none"
        style={{
          left: `calc(${saturation * 100}% - 7px)`,
          top: `calc(${(1 - value) * 100}% - 7px)`,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

// ─── 색조(Hue) 슬라이더 ───────────────────────────────────────────────────

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getHue = (e: React.MouseEvent | React.TouchEvent) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(x * 360);
  };

  return (
    <div
      ref={trackRef}
      className="relative h-3.5 rounded-full cursor-pointer select-none"
      style={{
        background: "linear-gradient(to right,#f00 0%,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,#f00 100%)",
        touchAction: "none",
      }}
      onMouseDown={e => { isDragging.current = true; getHue(e); }}
      onMouseMove={e => { if (isDragging.current) getHue(e); }}
      onMouseUp={() => { isDragging.current = false; }}
      onMouseLeave={() => { isDragging.current = false; }}
      onTouchStart={e => { isDragging.current = true; getHue(e); }}
      onTouchMove={e => { if (isDragging.current) getHue(e); }}
      onTouchEnd={() => { isDragging.current = false; }}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
        style={{
          left: `calc(${(hue / 360) * 100}% - 8px)`,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

// ─── Opacity 슬라이더 ─────────────────────────────────────────────────────

function AlphaSlider({
  alpha,
  r, g, b,
  onChange,
}: { alpha: number; r: number; g: number; b: number; onChange: (a: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getAlpha = (e: React.MouseEvent | React.TouchEvent) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(x);
  };

  return (
    <div
      ref={trackRef}
      className="relative h-3.5 rounded-full cursor-pointer select-none"
      style={{
        background: `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1)),
          repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 8px 8px`,
        touchAction: "none",
      }}
      onMouseDown={e => { isDragging.current = true; getAlpha(e); }}
      onMouseMove={e => { if (isDragging.current) getAlpha(e); }}
      onMouseUp={() => { isDragging.current = false; }}
      onMouseLeave={() => { isDragging.current = false; }}
      onTouchStart={e => { isDragging.current = true; getAlpha(e); }}
      onTouchMove={e => { if (isDragging.current) getAlpha(e); }}
      onTouchEnd={() => { isDragging.current = false; }}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
        style={{
          left: `calc(${alpha * 100}% - 8px)`,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

// ─── 메인 ColorPickerPopover ───────────────────────────────────────────────

interface ColorPickerPopoverProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ColorPickerPopover({ value, onChange, label }: ColorPickerPopoverProps) {
  const parsed = parseColor(value);
  const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);

  const [hue, setHue] = useState(hsv.h);
  const [sat, setSat] = useState(hsv.s);
  const [val, setVal] = useState(hsv.v);
  const [alpha, setAlpha] = useState(parsed.a);
  const [hexInput, setHexInput] = useState(rgbToHex(parsed.r, parsed.g, parsed.b));
  const [open, setOpen] = useState(false);

  // 외부 value가 바뀌면 내부 상태 동기화
  useEffect(() => {
    const p = parseColor(value);
    const h = rgbToHsv(p.r, p.g, p.b);
    setHue(h.h);
    setSat(h.s);
    setVal(h.v);
    setAlpha(p.a);
    setHexInput(rgbToHex(p.r, p.g, p.b));
  }, [value]);

  const getRgb = useCallback(() => hsvToRgb(hue, sat, val), [hue, sat, val]);

  const emit = useCallback((h: number, s: number, v: number, a: number) => {
    const { r, g, b } = hsvToRgb(h, s, v);
    onChange(toColorString(r, g, b, a));
    setHexInput(rgbToHex(r, g, b));
  }, [onChange]);

  const handleSpectrumChange = (s: number, v: number) => {
    setSat(s); setVal(v);
    emit(hue, s, v, alpha);
  };

  const handleHueChange = (h: number) => {
    setHue(h);
    emit(h, sat, val, alpha);
  };

  const handleAlphaChange = (a: number) => {
    setAlpha(a);
    const { r, g, b } = getRgb();
    onChange(toColorString(r, g, b, a));
  };

  const handleHexInput = (raw: string) => {
    setHexInput(raw);
    const hex = raw.startsWith("#") ? raw : "#" + raw;
    const rgb = hexToRgb(hex);
    if (rgb) {
      const h = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHue(h.h); setSat(h.s); setVal(h.v);
      onChange(toColorString(rgb.r, rgb.g, rgb.b, alpha));
    }
  };

  const handleSwatchClick = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const h = rgbToHsv(rgb.r, rgb.g, rgb.b);
    setHue(h.h); setSat(h.s); setVal(h.v);
    setHexInput(hex);
    onChange(toColorString(rgb.r, rgb.g, rgb.b, alpha));
  };

  const { r, g, b } = getRgb();
  const previewColor = toColorString(r, g, b, alpha);

  // 체커보드 배경 (투명도 표시용)
  const checkerBg = "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 12px 12px";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-9 w-9 rounded-md border border-input shadow-sm hover:scale-105 transition-transform shrink-0 overflow-hidden relative"
          title={label ? `${label}: ${value}` : value}
          style={{ background: checkerBg }}
        >
          <div className="absolute inset-0 rounded-md" style={{ backgroundColor: previewColor }} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-3 space-y-3"
        align="start"
        sideOffset={6}
        onOpenAutoFocus={e => e.preventDefault()}
      >
        {/* 스펙트럼 */}
        <SpectrumCanvas
          hue={hue}
          saturation={sat}
          value={val}
          onChange={handleSpectrumChange}
        />

        {/* 색조 + 투명도 슬라이더 */}
        <div className="space-y-2 px-0.5">
          <HueSlider hue={hue} onChange={handleHueChange} />
          <AlphaSlider alpha={alpha} r={r} g={g} b={b} onChange={handleAlphaChange} />
        </div>

        {/* Hex 입력 + 현재 색상 미리보기 */}
        <div className="flex gap-2 items-center">
          <div
            className="h-8 w-8 rounded border border-border shrink-0 overflow-hidden relative"
            style={{ background: checkerBg }}
          >
            <div className="absolute inset-0 rounded" style={{ backgroundColor: previewColor }} />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="flex gap-1">
              <Input
                value={hexInput}
                onChange={e => handleHexInput(e.target.value)}
                className="h-7 text-xs font-mono px-2"
                placeholder="#6B5FFF"
                maxLength={9}
              />
              <div className="flex items-center gap-1 shrink-0">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(alpha * 100)}
                  onChange={e => handleAlphaChange(Math.max(0, Math.min(100, Number(e.target.value))) / 100)}
                  className="h-7 w-14 text-xs font-mono px-2"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 브랜드 팔레트 스와치 */}
        <div>
          <Label className="text-[10px] text-muted-foreground mb-1.5 block">팔레트</Label>
          <div className="grid grid-cols-8 gap-1">
            {PALETTE_SWATCHES.map(hex => (
              <button
                key={hex}
                type="button"
                onClick={() => handleSwatchClick(hex)}
                className="h-6 w-6 rounded border border-border/60 hover:scale-110 transition-transform shadow-sm overflow-hidden relative"
                title={hex}
                style={{ background: checkerBg }}
              >
                <div className="absolute inset-0 rounded" style={{ backgroundColor: hex }} />
              </button>
            ))}
          </div>
        </div>

        {/* 현재 CSS 값 표시 */}
        <div className="flex items-center gap-1.5 bg-muted rounded px-2 py-1.5">
          <Pipette className="h-3 w-3 text-muted-foreground shrink-0" />
          <code className="text-[10px] font-mono text-muted-foreground truncate flex-1">
            {previewColor}
          </code>
        </div>
      </PopoverContent>
    </Popover>
  );
}

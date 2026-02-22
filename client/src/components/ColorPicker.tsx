import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Palette, X } from "lucide-react";
import { MUUN_COLOR_PALETTE } from "@/lib/colorPalette";

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
  onColorClear?: () => void;
  currentColor?: string;
}

/**
 * 색상 선택 컴포넌트
 * 무운 브랜드 컬러 팔레트에서 색상을 선택합니다.
 */
export function ColorPicker({
  onColorSelect,
  onColorClear,
  currentColor,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (value: string) => {
    onColorSelect(value);
    setIsOpen(false);
  };

  const handleClear = () => {
    if (onColorClear) {
      onColorClear();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Palette className="w-4 h-4 text-gray-600" />
        <Select onValueChange={handleColorSelect} open={isOpen} onOpenChange={setIsOpen}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="색상 선택" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {MUUN_COLOR_PALETTE.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: color.value }}
                  />
                  <span>{color.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 현재 색상 미리보기 */}
      {currentColor && (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border-2 border-gray-300"
            style={{ backgroundColor: currentColor }}
            title={`현재 색상: ${currentColor}`}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            title="색상 제거"
            className="h-8 px-2 text-xs"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

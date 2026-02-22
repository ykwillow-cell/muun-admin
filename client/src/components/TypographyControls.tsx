import { Editor } from "@tiptap/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Type, Weight } from "lucide-react";

interface TypographyControlsProps {
  editor: Editor | null;
}

const FONT_SIZES = [
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
];

const FONT_WEIGHTS = [
  { label: "Light (300)", value: "300" },
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Bold (700)", value: "700" },
];

/**
 * 타이포그래피 제어 컴포넌트
 * 텍스트 크기와 폰트 두께를 드롭다운으로 제어합니다.
 * 인라인 스타일로 직접 적용됩니다.
 */
export function TypographyControls({ editor }: TypographyControlsProps) {
  if (!editor) {
    return null;
  }

  const handleFontSizeChange = (size: string) => {
    editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
  };

  const handleFontWeightChange = (weight: string) => {
    editor.chain().focus().setMark("textStyle", { fontWeight: weight }).run();
  };

  const handleResetTypography = () => {
    editor.chain().focus().clearNodes().run();
  };

  return (
    <div className="flex items-center gap-2">
      {/* 텍스트 크기 선택 */}
      <div className="flex items-center gap-1">
        <Type className="w-4 h-4 text-gray-600" />
        <Select onValueChange={handleFontSizeChange}>
          <SelectTrigger className="w-24 h-8 text-xs">
            <SelectValue placeholder="크기" />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 폰트 두께 선택 */}
      <div className="flex items-center gap-1">
        <Weight className="w-4 h-4 text-gray-600" />
        <Select onValueChange={handleFontWeightChange}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="두께" />
          </SelectTrigger>
          <SelectContent>
            {FONT_WEIGHTS.map((weight) => (
              <SelectItem key={weight.value} value={weight.value}>
                {weight.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 리셋 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleResetTypography}
        title="타이포그래피 초기화"
        className="h-8 px-2 text-xs"
      >
        초기화
      </Button>
    </div>
  );
}

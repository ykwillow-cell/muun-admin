import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { common, createLowlight } from "lowlight";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";
import { TypographyControls } from "./TypographyControls";
import "./RichTextEditor.css";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * TipTap 기반 WYSIWYG 에디터 컴포넌트
 * 마크다운 기호가 노출되지 않는 깔끔한 디자인 모드 제공
 * 고급 타이포그래피 제어 기능 포함 (텍스트 크기, 폰트 두께)
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "칼럼 내용을 입력하세요...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextStyle,
      // 커스텀 타이포그래피 확장
      // TextSize와 FontWeight 확장은 추후 추가
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // HTML로 변환하여 저장
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleAddImage = () => {
    const url = window.prompt("이미지 URL을 입력하세요:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleAddLink = () => {
    const url = window.prompt("링크 URL을 입력하세요:");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  return (
    <div className="rich-text-editor-container border rounded-lg overflow-hidden bg-white">
      {/* 주 툴바 */}
      <div className="toolbar flex flex-wrap gap-1 p-3 border-b bg-gray-50">
        {/* 제목 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""}
          title="제목 (H2)"
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-gray-200" : ""}
          title="제목 (H3)"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px bg-gray-300" />

        {/* 텍스트 스타일 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200" : ""}
          title="굵게"
        >
          <Bold className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200" : ""}
          title="기울임"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "bg-gray-200" : ""}
          title="인라인 코드"
        >
          <Code className="w-4 h-4" />
        </Button>

        <div className="w-px bg-gray-300" />

        {/* 리스트 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
          title="순서 없는 리스트"
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
          title="순서 있는 리스트"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px bg-gray-300" />

        {/* 블록 요소 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-gray-200" : ""}
          title="인용구"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선"
        >
          <Minus className="w-4 h-4" />
        </Button>

        <div className="w-px bg-gray-300" />

        {/* 미디어 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddImage}
          title="이미지 삽입"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddLink}
          title="링크 추가"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>

        <div className="w-px bg-gray-300" />

        {/* 실행 취소/재실행 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="실행 취소"
        >
          <Undo2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="재실행"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      {/* 타이포그래피 제어 툴바 */}
      <div className="typography-toolbar flex items-center gap-3 p-3 border-b bg-gray-50">
        <TypographyControls editor={editor} />
      </div>

      {/* 에디터 */}
      <div className="editor-content p-4 min-h-96">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

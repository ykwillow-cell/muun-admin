import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  Loader2,
  ArrowLeft,
  Eye,
  Save,
  Globe,
  Clock,
  Image,
  FileText,
  Settings,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { useRef } from "react";
import { useColumn, useCreateColumn, useUpdateColumn } from "@/lib/queries";
import { CATEGORY_OPTIONS, type ColumnFormData, storageApi } from "@/lib/supabase";
import { toast } from "sonner";

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const btn = (active: boolean) =>
    `px-2 py-1 rounded text-sm font-medium transition-colors ${
      active
        ? "bg-slate-900 text-white"
        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
    }`;
  return (
    <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border border-slate-200 rounded-t-md">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic"))}
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btn(editor.isActive("strike"))}
      >
        <s>S</s>
      </button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive("heading", { level: 2 }))}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btn(editor.isActive("heading", { level: 3 }))}
      >
        H3
      </button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
      >
        목록
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
      >
        번호목록
      </button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive("blockquote"))}
      >
        인용
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={btn(false)}
      >
        구분선
      </button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <button
        type="button"
        onClick={() => {
          const u = window.prompt("링크 URL:");
          if (u) editor.chain().focus().setLink({ href: u }).run();
        }}
        className={btn(editor.isActive("link"))}
      >
        링크
      </button>
      <button
        type="button"
        onClick={() => {
          const u = window.prompt("이미지 URL:");
          if (u) editor.chain().focus().setImage({ src: u }).run();
        }}
        className={btn(false)}
      >
        이미지
      </button>
    </div>
  );
}

export default function ColumnEditor() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const columnId = params?.id;
  const isEditMode = !!columnId;

  const [form, setForm] = useState<ColumnFormData>({
    title: "",
    description: "",
    content: "",
    category: "luck",
    author: "무운 역술팀",
    thumbnail_url: "",
    read_time: 5,
    meta_title: "",
    meta_description: "",
    keywords: "",
    published: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">(
    "content"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: column, isLoading: isLoadingColumn } = useColumn(
    columnId || ""
  );
  const createMutation = useCreateColumn();
  const updateMutation = useUpdateColumn();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      TiptapImage,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[400px] p-4 focus:outline-none border border-t-0 border-slate-200 rounded-b-md",
      },
    },
  });

  useEffect(() => {
    if (column && editor) {
      const t = column.title || column.name || "";
      setForm({
        title: t,
        description: column.description || "",
        content: column.content || "",
        category: column.category || "luck",
        author: column.author || "무운 역술팀",
        thumbnail_url: column.thumbnail_url || "",
        read_time: column.read_time || 5,
        meta_title: column.meta_title || "",
        meta_description: column.meta_description || "",
        keywords: column.keywords ? column.keywords.join(", ") : "",
        published: column.published || false,
      });
      if (column.content) editor.commands.setContent(column.content);
    }
  }, [column, editor]);

  const handleSave = async (publishNow?: boolean) => {
    if (!form.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    setIsSaving(true);
    try {
      const saveData = {
        ...form,
        published:
          publishNow !== undefined ? publishNow : form.published,
      };
      if (isEditMode && columnId) {
        await updateMutation.mutateAsync({ id: columnId, formData: saveData });
        toast.success("칼럼이 수정되었습니다.");
      } else {
        await createMutation.mutateAsync(saveData);
        toast.success("칼럼이 저장되었습니다.");
      }
      setLocation("/columns");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const set = <K extends keyof ColumnFormData>(k: K, v: ColumnFormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const url = await storageApi.uploadThumbnail(file);
      set("thumbnail_url", url);
      toast.success("썸네일 이미지가 업로드되었습니다.");
    } catch (err: any) {
      toast.error(err.message || "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleThumbnailRemove = async () => {
    if (form.thumbnail_url) {
      await storageApi.deleteThumbnail(form.thumbnail_url).catch(() => {});
    }
    set("thumbnail_url", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoadingColumn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  const catLabel =
    CATEGORY_OPTIONS.find((c) => c.value === form.category)?.label ||
    form.category;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/columns")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">목록으로</span>
            </button>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900">
                {isEditMode ? "칼럼 편집" : "새 칼럼 작성"}
              </h1>
              {form.published ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  발행됨
                </Badge>
              ) : (
                <Badge variant="secondary">임시저장</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {form.published && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open("https://muunsaju.com/guide", "_blank")
                }
              >
                <Eye className="w-4 h-4 mr-1" />
                사이트 확인
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              임시저장
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Globe className="w-4 h-4 mr-1" />
              )}
              발행하기
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 편집 영역 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 제목 */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="칼럼 제목을 입력하세요..."
                className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto placeholder:text-slate-300"
                style={{ fontSize: "1.5rem", fontWeight: "700" }}
              />
            </div>

            {/* 요약 */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                요약 (카드에 표시되는 설명)
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="칼럼의 핵심 내용을 2~3문장으로 요약하세요..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                {form.description.length} / 200자 권장
              </p>
            </div>

            {/* 탭 에디터 */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="flex border-b border-slate-200">
                {[
                  { key: "content", label: "본문", Icon: FileText },
                  { key: "seo", label: "SEO", Icon: Globe },
                  { key: "settings", label: "설정", Icon: Settings },
                ].map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setActiveTab(key as typeof activeTab)
                    }
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === key
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
              <div className="p-4">
                {activeTab === "content" && (
                  <div>
                    <EditorToolbar editor={editor} />
                    <EditorContent editor={editor} />
                  </div>
                )}
                {activeTab === "seo" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1 block">
                        SEO 제목 (비어있으면 칼럼 제목 사용)
                      </Label>
                      <Input
                        value={form.meta_title}
                        onChange={(e) => set("meta_title", e.target.value)}
                        placeholder={form.title || "SEO 제목"}
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        {(form.meta_title || form.title).length} / 60자 권장
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1 block">
                        메타 설명
                      </Label>
                      <Textarea
                        value={form.meta_description}
                        onChange={(e) =>
                          set("meta_description", e.target.value)
                        }
                        placeholder="검색 결과에 표시될 설명..."
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        {form.meta_description.length} / 160자 권장
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1 block">
                        키워드 (쉼표로 구분)
                      </Label>
                      <Input
                        value={form.keywords}
                        onChange={(e) => set("keywords", e.target.value)}
                        placeholder="사주, 운세, 개운법..."
                      />
                      {form.keywords && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {form.keywords
                            .split(",")
                            .map(
                              (k, i) =>
                                k.trim() && (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {k.trim()}
                                  </Badge>
                                )
                            )}
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-xs font-medium text-slate-500 mb-2">
                        검색 결과 미리보기
                      </p>
                      <p className="text-blue-600 text-base font-medium truncate">
                        {form.meta_title || form.title || "제목 없음"}
                      </p>
                      <p className="text-green-700 text-xs">
                        muunsaju.com/guide/...
                      </p>
                      <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                        {form.meta_description ||
                          form.description ||
                          "설명 없음"}
                      </p>
                    </div>
                  </div>
                )}
                {activeTab === "settings" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-3 block">
                        카테고리
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => set("category", opt.value)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                              form.category === opt.value
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1 block">
                        작성자
                      </Label>
                      <Input
                        value={form.author}
                        onChange={(e) => set("author", e.target.value)}
                        placeholder="무운 역술팀"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1 block">
                        <Clock className="w-4 h-4 inline mr-1" />
                        읽기 시간 (분)
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={form.read_time}
                        onChange={(e) =>
                          set("read_time", parseInt(e.target.value) || 5)
                        }
                        className="w-24"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 발행 상태 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  발행 상태
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="pub-switch"
                    className="text-sm text-slate-700"
                  >
                    발행 여부
                  </Label>
                  <Switch
                    id="pub-switch"
                    checked={form.published}
                    onCheckedChange={(v) => set("published", v)}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {form.published
                    ? "muunsaju.com/guide에 노출됩니다."
                    : "임시저장 상태입니다. 발행 시 사이트에 노출됩니다."}
                </p>
                <Separator />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleSave(true)}
                    disabled={isSaving}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4 mr-1" />
                    )}
                    발행하기
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                    className="w-full"
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    임시저장
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 썸네일 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  썸네일 이미지
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.thumbnail_url ? (
                  <div className="space-y-2">
                    <div className="aspect-video rounded-md overflow-hidden bg-slate-100 relative group">
                      <img
                        src={form.thumbnail_url}
                        alt="썸네일"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={handleThumbnailRemove}
                      type="button"
                    >
                      이미지 삭제
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-slate-200 rounded-md p-6 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                        <p className="text-xs text-slate-500">이미지 최적화 및 업로드 중...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Image className="w-8 h-8 text-slate-300" />
                        <p className="text-sm font-medium text-slate-600">클릭하여 이미지 첨부</p>
                        <p className="text-xs text-slate-400">JPG, PNG, WebP · 최대 10MB (자동 최적화)</p>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleThumbnailUpload}
                  disabled={isUploadingImage}
                />
              </CardContent>
            </Card>

            {/* 칼럼 정보 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  칼럼 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">카테고리</span>
                  <Badge variant="secondary">{catLabel}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">작성자</span>
                  <span className="text-slate-700">{form.author || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">읽기 시간</span>
                  <span className="text-slate-700">{form.read_time}분</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

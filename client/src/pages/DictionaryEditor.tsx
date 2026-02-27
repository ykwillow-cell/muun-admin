import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, BookOpen, X } from "lucide-react";
import { useDictionary, useCreateDictionary, useUpdateDictionary } from "@/lib/queries";
import { DICTIONARY_CATEGORY_OPTIONS, type FortuneDictionaryFormData } from "@/lib/supabase";
import { toast } from "sonner";

const EMPTY_FORM: FortuneDictionaryFormData = {
  title: "",
  slug: "",
  subtitle: "",
  summary: "",
  original_meaning: "",
  modern_interpretation: "",
  muun_advice: "",
  category: "basic",
  tags: "",
  meta_title: "",
  meta_description: "",
  published: false,
};

export default function DictionaryEditor() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id && params.id !== "new";

  const [form, setForm] = useState<FortuneDictionaryFormData>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [tagList, setTagList] = useState<string[]>([]);

  const { data: existing } = useDictionary(isEdit ? params.id! : "");
  const createMutation = useCreateDictionary();
  const updateMutation = useUpdateDictionary();

  useEffect(() => {
    if (existing && isEdit) {
      setForm({
        title: existing.title || "",
        slug: existing.slug || "",
        subtitle: existing.subtitle || "",
        summary: existing.summary || "",
        original_meaning: existing.original_meaning || "",
        modern_interpretation: existing.modern_interpretation || "",
        muun_advice: existing.muun_advice || "",
        category: existing.category || "basic",
        tags: (existing.tags || []).join(", "),
        meta_title: existing.meta_title || "",
        meta_description: existing.meta_description || "",
        published: existing.published || false,
      });
      setTagList(existing.tags || []);
    }
  }, [existing, isEdit]);

  const handleChange = (field: keyof FortuneDictionaryFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tagList.includes(trimmed)) {
      const newList = [...tagList, trimmed];
      setTagList(newList);
      setForm((prev) => ({ ...prev, tags: newList.join(", ") }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newList = tagList.filter((t) => t !== tag);
    setTagList(newList);
    setForm((prev) => ({ ...prev, tags: newList.join(", ") }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (publishNow?: boolean) => {
    if (!form.title.trim()) {
      toast.error("제목을 입력해 주세요.");
      return;
    }
    if (!form.summary.trim()) {
      toast.error("요약을 입력해 주세요.");
      return;
    }
    if (!form.original_meaning.trim()) {
      toast.error("원래 의미를 입력해 주세요.");
      return;
    }
    if (!form.modern_interpretation.trim()) {
      toast.error("현대적 해석을 입력해 주세요.");
      return;
    }
    if (!form.muun_advice.trim()) {
      toast.error("무운의 조언을 입력해 주세요.");
      return;
    }

    const submitData = {
      ...form,
      published: publishNow !== undefined ? publishNow : form.published,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: params.id!, formData: submitData });
        toast.success("운세 사전 항목이 수정되었습니다.");
      } else {
        await createMutation.mutateAsync(submitData);
        toast.success("운세 사전 항목이 등록되었습니다.");
      }
      setLocation("/dictionary");
    } catch (err: any) {
      toast.error(`저장에 실패했습니다: ${err?.message || ""}`);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dictionary")} className="flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            목록
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900">
              {isEdit ? "운세 사전 수정" : "운세 사전 새 항목"}
            </h1>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
            >
              임시저장
            </Button>
            <Button
              size="sm"
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Save className="w-4 h-4 mr-1" />
              {isEdit ? "수정 & 발행" : "등록 & 발행"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label className="mb-1.5 block text-sm">
                  제목 <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="예: 갑자(甲子)"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">부제목</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => handleChange("subtitle", e.target.value)}
                  placeholder="예: 천간 갑(甲)과 지지 자(子)의 만남"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">
                  URL 슬러그
                </Label>
                <Input
                  value={form.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="자동 생성 (비워두면 제목 기반으로 생성)"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">
                  요약 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={form.summary}
                  onChange={(e) => handleChange("summary", e.target.value)}
                  placeholder="이 용어를 한두 문장으로 간략히 설명해 주세요."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* 본문 내용 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">본문 내용</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label className="mb-1.5 block text-sm">
                  원래 의미 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={form.original_meaning}
                  onChange={(e) => handleChange("original_meaning", e.target.value)}
                  placeholder="전통적·학문적 의미를 설명해 주세요."
                  rows={4}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">
                  현대적 해석 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={form.modern_interpretation}
                  onChange={(e) => handleChange("modern_interpretation", e.target.value)}
                  placeholder="현대인의 삶에 적용하는 방식으로 해석해 주세요."
                  rows={4}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">
                  무운의 조언 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={form.muun_advice}
                  onChange={(e) => handleChange("muun_advice", e.target.value)}
                  placeholder="무운이 독자에게 전하는 따뜻한 조언을 작성해 주세요."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO 설정</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label className="mb-1.5 block text-sm">메타 제목</Label>
                <Input
                  value={form.meta_title}
                  onChange={(e) => handleChange("meta_title", e.target.value)}
                  placeholder="검색 결과에 표시될 제목 (비우면 제목 사용)"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">메타 설명</Label>
                <Textarea
                  value={form.meta_description}
                  onChange={(e) => handleChange("meta_description", e.target.value)}
                  placeholder="검색 결과에 표시될 설명 (160자 이내 권장)"
                  rows={2}
                />
                <p className="text-xs text-slate-400 mt-1">{form.meta_description.length}/160자</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="flex flex-col gap-6">
          {/* 카테고리 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">카테고리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {DICTIONARY_CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange("category", opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      form.category === opt.value
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-white text-slate-600 border-slate-300 hover:border-amber-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 태그 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">태그</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="태그 입력 후 Enter"
                  className="text-sm"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                  추가
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tagList.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {tagList.length === 0 && (
                  <p className="text-xs text-slate-400">태그를 추가하면 검색 노출에 도움이 됩니다.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 발행 상태 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">발행 상태</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleChange("published", false)}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium border transition-all text-left ${
                    !form.published
                      ? "bg-yellow-50 text-yellow-800 border-yellow-300"
                      : "bg-white text-slate-600 border-slate-200 hover:border-yellow-300"
                  }`}
                >
                  임시저장
                  <p className="text-xs font-normal mt-0.5 opacity-70">사이트에 노출되지 않습니다</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("published", true)}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium border transition-all text-left ${
                    form.published
                      ? "bg-green-50 text-green-800 border-green-300"
                      : "bg-white text-slate-600 border-slate-200 hover:border-green-300"
                  }`}
                >
                  발행됨
                  <p className="text-xs font-normal mt-0.5 opacity-70">사이트에 즉시 노출됩니다</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

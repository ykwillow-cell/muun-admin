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
  FileText,
  Settings,
} from "lucide-react";
import { useDream, useCreateDream, useUpdateDream } from "@/lib/queries";
import {
  DREAM_CATEGORY_OPTIONS,
  DREAM_GRADE_OPTIONS,
  type DreamFormData,
} from "@/lib/supabase";
import { toast } from "sonner";

export default function DreamEditor() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const dreamId = params?.id;
  const isEditMode = !!dreamId;

  const [form, setForm] = useState<DreamFormData>({
    keyword: "",
    slug: "",
    interpretation: "",
    traditional_meaning: "",
    psychological_meaning: "",
    category: "other",
    grade: "good",
    score: 0,
    meta_title: "",
    meta_description: "",
    published: false,
  });
  const [scoreInput, setScoreInput] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const { data: dream, isLoading: isLoadingDream } = useDream(dreamId || "");
  const createMutation = useCreateDream();
  const updateMutation = useUpdateDream();

  useEffect(() => {
    if (dream) {
      const s = dream.score ?? 0;
      setForm({
        keyword: dream.keyword || "",
        slug: dream.slug || "",
        interpretation: dream.interpretation || "",
        traditional_meaning: dream.traditional_meaning || "",
        psychological_meaning: dream.psychological_meaning || "",
        category: dream.category || "other",
        grade: dream.grade || "good",
        score: s,
        meta_title: dream.meta_title || "",
        meta_description: dream.meta_description || "",
        published: dream.published || false,
      });
      setScoreInput(s > 0 ? String(s) : "");
      setSlugManuallyEdited(true);
    }
  }, [dream]);

  const handleKeywordChange = (value: string) => {
    setForm((prev) => ({ ...prev, keyword: value }));
    if (!slugManuallyEdited) {
      // 자동 slug 생성: 한글 키워드를 그대로 사용 (서버에서 타임스탬프 추가)
      const autoSlug = value.replace(/\s+/g, "-").toLowerCase();
      setForm((prev) => ({ ...prev, keyword: value, slug: autoSlug }));
    }
  };

  const handleSave = async (publishNow?: boolean) => {
    if (!form.keyword.trim()) {
      toast.error("꿈 키워드를 입력해주세요.");
      return;
    }
    if (!form.interpretation.trim()) {
      toast.error("꿈 해석 내용을 입력해주세요.");
      return;
    }
    setIsSaving(true);
    try {
      const saveData = {
        ...form,
        published: publishNow !== undefined ? publishNow : form.published,
      };
      if (isEditMode && dreamId) {
        await updateMutation.mutateAsync({ id: dreamId, formData: saveData });
        toast.success("꿈해몽이 수정되었습니다.");
      } else {
        await createMutation.mutateAsync(saveData);
        toast.success("꿈해몽이 저장되었습니다.");
      }
      setLocation("/dreams");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const set = <K extends keyof DreamFormData>(k: K, v: DreamFormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  if (isLoadingDream) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  const catLabel =
    DREAM_CATEGORY_OPTIONS.find((c) => c.value === form.category)?.label || form.category;
  const gradeLabel =
    DREAM_GRADE_OPTIONS.find((g) => g.value === form.grade)?.label || form.grade;

  const tabBtn = (tab: typeof activeTab) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      activeTab === tab
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/dreams")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">목록으로</span>
            </button>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900">
                {isEditMode ? "꿈해몽 편집" : "새 꿈해몽 작성"}
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
            {form.published && dream?.slug && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(`https://muunsaju.com/dream/${dream.slug}`, "_blank")
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* 메인 에디터 영역 */}
          <div className="space-y-4">
            {/* 탭 */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 w-fit">
              <button className={tabBtn("content")} onClick={() => setActiveTab("content")}>
                <FileText className="w-4 h-4" />
                내용
              </button>
              <button className={tabBtn("seo")} onClick={() => setActiveTab("seo")}>
                <Globe className="w-4 h-4" />
                SEO
              </button>
              <button className={tabBtn("settings")} onClick={() => setActiveTab("settings")}>
                <Settings className="w-4 h-4" />
                설정
              </button>
            </div>

            {/* 내용 탭 */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {/* 키워드 */}
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1 block">
                        꿈 키워드 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={form.keyword}
                        onChange={(e) => handleKeywordChange(e.target.value)}
                        placeholder="예: 돼지꿈, 뱀꿈, 불꿈..."
                        className="text-lg font-medium"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        검색 및 페이지 제목에 사용됩니다.
                      </p>
                    </div>

                    {/* 해석 */}
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1 block">
                        꿈 해석 <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={form.interpretation}
                        onChange={(e) => set("interpretation", e.target.value)}
                        placeholder="꿈의 전반적인 의미와 해석을 작성하세요..."
                        rows={6}
                        className="resize-none"
                      />
                    </div>

                    {/* 전통적 의미 */}
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1 block">
                        전통적 의미
                      </Label>
                      <Textarea
                        value={form.traditional_meaning}
                        onChange={(e) => set("traditional_meaning", e.target.value)}
                        placeholder="전통 민간 해석에서의 의미를 작성하세요..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    {/* 심리학적 의미 */}
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1 block">
                        심리학적 의미
                      </Label>
                      <Textarea
                        value={form.psychological_meaning}
                        onChange={(e) => set("psychological_meaning", e.target.value)}
                        placeholder="현대 심리학적 관점에서의 해석을 작성하세요..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* SEO 탭 */}
            {activeTab === "seo" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">검색엔진 최적화 (SEO)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1 block">
                      URL Slug
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400 whitespace-nowrap">
                        muunsaju.com/dream/
                      </span>
                      <Input
                        value={form.slug}
                        onChange={(e) => {
                          setSlugManuallyEdited(true);
                          set("slug", e.target.value);
                        }}
                        placeholder="dream-slug"
                        className="font-mono text-sm"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      비워두면 자동으로 생성됩니다. 영문, 숫자, 하이픈만 권장합니다.
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1 block">
                      메타 제목
                    </Label>
                    <Input
                      value={form.meta_title}
                      onChange={(e) => set("meta_title", e.target.value)}
                      placeholder={`${form.keyword} 꿈해몽 - 무운`}
                      maxLength={60}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {form.meta_title.length}/60자 · 비워두면 키워드 기반으로 자동 생성됩니다.
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1 block">
                      메타 설명
                    </Label>
                    <Textarea
                      value={form.meta_description}
                      onChange={(e) => set("meta_description", e.target.value)}
                      placeholder={`${form.keyword}에 대한 꿈해몽 풀이입니다...`}
                      rows={3}
                      maxLength={160}
                      className="resize-none"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {form.meta_description.length}/160자 · 검색 결과에 표시되는 설명입니다.
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-md p-4">
                    <p className="text-xs font-medium text-slate-600 mb-2">검색 결과 미리보기</p>
                    <div className="space-y-1">
                      <p className="text-sm text-blue-600 font-medium truncate">
                        {form.meta_title || `${form.keyword || "꿈 키워드"} 꿈해몽 - 무운`}
                      </p>
                      <p className="text-xs text-green-700">
                        muunsaju.com/dream/{form.slug || "slug"}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {form.meta_description ||
                          form.interpretation?.slice(0, 120) ||
                          "꿈해몽 설명이 여기에 표시됩니다."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 설정 탭 */}
            {activeTab === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">꿈해몽 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 카테고리 태그 선택 */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-3 block">
                      카테고리
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {DREAM_CATEGORY_OPTIONS.map((opt) => (
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

                  {/* 꿈 등급 태그 선택 */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-3 block">
                      꿈 등급
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {DREAM_GRADE_OPTIONS.map((opt) => {
                        const gradeStyle =
                          opt.value === "great"
                            ? form.grade === opt.value
                              ? "bg-yellow-500 text-white border-yellow-500"
                              : "bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                            : opt.value === "bad"
                            ? form.grade === opt.value
                              ? "bg-red-500 text-white border-red-500"
                              : "bg-white text-red-700 border-red-300 hover:bg-red-50"
                            : form.grade === opt.value
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50";
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => set("grade", opt.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${gradeStyle}`}
                          >
                            {opt.value === "great" ? "🌟 " : opt.value === "bad" ? "⚠️ " : "✅ "}
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 운세 점수 */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-3 block">
                      운세 점수 (0~100)
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={scoreInput}
                        placeholder="점수 입력"
                        onChange={(e) => {
                          const raw = e.target.value;
                          setScoreInput(raw);
                          const n = parseInt(raw);
                          set("score", isNaN(n) ? 0 : Math.min(100, Math.max(0, n)));
                        }}
                        className="w-28"
                      />
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            form.score >= 80
                              ? "bg-yellow-500"
                              : form.score >= 50
                              ? "bg-blue-500"
                              : form.score > 0
                              ? "bg-red-400"
                              : ""
                          }`}
                          style={{ width: `${form.score}%` }}
                        />
                      </div>
                      {scoreInput !== "" && (
                        <span className="text-sm font-medium text-slate-700 w-12">
                          {form.score}점
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      80점 이상: 길몽 / 50~79점: 보통 / 49점 이하: 흉몽
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 발행 상태 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">발행 상태</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pub-switch" className="text-sm text-slate-700">
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
                    ? "muunsaju.com/dream에 노출됩니다."
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

            {/* 꿈해몽 정보 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">꿈해몽 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">카테고리</span>
                  <Badge variant="secondary">{catLabel}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">등급</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      form.grade === "great"
                        ? "bg-yellow-100 text-yellow-800"
                        : form.grade === "bad"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {gradeLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">점수</span>
                  <span className="text-slate-700 font-medium">{form.score}점</span>
                </div>
                {form.slug && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-slate-500 text-xs mb-1">URL</p>
                    <p className="text-xs text-slate-600 font-mono break-all">
                      /dream/{form.slug}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

/**
 * 칼럼 작성/편집 페이지
 * 새 칼럼을 작성하거나 기존 칼럼을 편집하는 페이지
 */
export default function ColumnEditor() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const columnId = params?.id ? parseInt(params.id) : undefined;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 카테고리 목록 조회
  const { data: categories = [] } = trpc.categories.list.useQuery();

  // 기존 칼럼 조회 (편집 모드)
  const { data: column, isLoading: isLoadingColumn } = trpc.columns.get.useQuery(
    columnId || 0,
    { enabled: !!columnId }
  );

  // 칼럼 생성
  const createMutation = trpc.columns.create.useMutation({
    onSuccess: () => {
      setLocation("/columns");
    },
  });

  // 기존 칼럼 데이터 로드
  useEffect(() => {
    if (column) {
      setTitle(column.title);
      setSlug(column.slug);
      setExcerpt(column.content.substring(0, 200) || "");
      setContent(column.content);
      setCategory(column.category || "");
      setAuthor(column.author || "");
      setPublished(column.published);
      setMetaTitle(column.metaTitle || "");
      setMetaDescription(column.metaDescription || "");
    }
  }, [column]);

  // 제목 변경 시 슬러그 자동 생성
  useEffect(() => {
    if (!columnId && title) {
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(newSlug);
    }
  }, [title, columnId]);

  // 칼럼 업데이트
  const updateMutation = trpc.columns.update.useMutation({
    onSuccess: () => {
      setLocation("/columns");
    },
  });

  const handleSave = async () => {
    if (!title || !content || !category) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        slug,
        title,
        category: category.toString(),
        author,
        content,
        metaTitle: metaTitle || "",
        metaDescription: metaDescription || "",
        canonicalUrl: "",
        thumbnailUrl: "",
        published,
      };

      if (columnId) {
        await updateMutation.mutateAsync({
          id: columnId,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "저장에 실패했습니다.";
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (columnId && isLoadingColumn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/columns")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {columnId ? "칼럼 편집" : "새 칼럼 작성"}
          </h1>
          <p className="text-gray-600 mt-1">
            {columnId ? "기존 칼럼을 수정하세요." : "새로운 칼럼을 작성하세요."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">제목 *</label>
                <Input
                  placeholder="칼럼 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">슬러그 *</label>
                <Input
                  placeholder="url-friendly-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">요약</label>
                <Textarea
                  placeholder="칼럼 요약을 입력하세요"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">내용 *</label>
                <Textarea
                  placeholder="칼럼 내용을 입력하세요 (마크다운 지원)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

            {/* SEO 메타데이터 */}
          <Card>
            <CardHeader>
              <CardTitle>SEO 메타데이터</CardTitle>
              <CardDescription>검색 엔진 최적화를 위한 메타 정보</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">메타 제목</label>
                <Input
                  placeholder="SEO 메타 제목"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">메타 설명</label>
                <Textarea
                  placeholder="SEO 메타 설명 (160자 이내)"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 발행 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>발행 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">카테고리 *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">작성자</label>
                <Input
                  placeholder="작성자명"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="published" className="text-sm font-medium cursor-pointer">
                  발행하기
                </label>
              </div>


            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !title || !content || !category || createMutation.isPending || updateMutation.isPending}
                className="w-full"
              >
                {isSaving || createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  columnId ? "수정 완료" : "작성 완료"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/columns")}
                className="w-full"
              >
                취소
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

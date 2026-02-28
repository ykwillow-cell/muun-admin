import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit2, Trash2, Plus, Search, Eye, ArrowUpAZ, CalendarDays } from "lucide-react";
import { useLocation } from "wouter";
import { useDreamsList, useDeleteDream } from "@/lib/queries";
import { DREAM_CATEGORY_OPTIONS, DREAM_GRADE_OPTIONS } from "@/lib/supabase";
import { toast } from "sonner";

export default function DreamList() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "keyword">("date");

  const { data: dreams = [], isLoading } = useDreamsList();
  const deleteDreamMutation = useDeleteDream();

  const filteredDreams = dreams
    .filter((d: any) => {
      const matchSearch = d.keyword.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "published" && d.published) ||
        (filterStatus === "draft" && !d.published);
      const matchCategory =
        filterCategory === "all" || d.category === filterCategory;
      return matchSearch && matchStatus && matchCategory;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "keyword") {
        return a.keyword.localeCompare(b.keyword, "ko");
      }
      // date: 최신순
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleDelete = async (id: string, keyword: string) => {
    if (confirm(`"${keyword}" 꿈해몽을 삭제하시겠습니까?`)) {
      try {
        await deleteDreamMutation.mutateAsync(id);
        toast.success("꿈해몽이 삭제되었습니다.");
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error("삭제에 실패했습니다.");
      }
    }
  };

  const publishedCount = dreams.filter((d: any) => d.published).length;
  const draftCount = dreams.length - publishedCount;

  const getCategoryLabel = (category: string) =>
    DREAM_CATEGORY_OPTIONS.find((c) => c.value === category)?.label || category;

  const getGradeLabel = (grade: string) =>
    DREAM_GRADE_OPTIONS.find((g) => g.value === grade)?.label || grade;

  const getGradeBadgeClass = (grade: string) => {
    if (grade === "great") return "bg-yellow-100 text-yellow-800";
    if (grade === "bad") return "bg-red-100 text-red-800";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">꿈해몽 관리</h1>
            <p className="text-slate-600">muunsaju.com/dream에 노출되는 꿈해몽을 관리하세요</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation("/")} size="lg">
              ← 대시보드
            </Button>
            <Button onClick={() => setLocation("/dreams/new")} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              새 꿈해몽 작성
            </Button>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setFilterStatus("all")}
            className={`bg-white rounded-lg border p-4 text-left transition-colors ${filterStatus === "all" ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200 hover:border-slate-300"}`}
          >
            <p className="text-sm text-slate-500">전체</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{dreams.length}</p>
          </button>
          <button
            onClick={() => setFilterStatus("published")}
            className={`bg-white rounded-lg border p-4 text-left transition-colors ${filterStatus === "published" ? "border-green-600 ring-1 ring-green-600" : "border-slate-200 hover:border-slate-300"}`}
          >
            <p className="text-sm text-slate-500">발행됨</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{publishedCount}</p>
          </button>
          <button
            onClick={() => setFilterStatus("draft")}
            className={`bg-white rounded-lg border p-4 text-left transition-colors ${filterStatus === "draft" ? "border-yellow-600 ring-1 ring-yellow-600" : "border-slate-200 hover:border-slate-300"}`}
          >
            <p className="text-sm text-slate-500">임시저장</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{draftCount}</p>
          </button>
        </div>

        {/* 검색 & 필터 */}
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="꿈 키워드로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="all">전체 카테고리</option>
            {DREAM_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {/* 정렬 토글 버튼 */}
          <div className="flex gap-1 bg-white border border-slate-200 rounded-md p-1">
            <button
              onClick={() => setSortBy("date")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                sortBy === "date"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title="최신 작성일순"
            >
              <CalendarDays className="w-4 h-4" />
              최신순
            </button>
            <button
              onClick={() => setSortBy("keyword")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                sortBy === "keyword"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title="제목(키워드) 가나다순"
            >
              <ArrowUpAZ className="w-4 h-4" />
              제목순
            </button>
          </div>
        </div>

        {/* 꿈해몽 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>꿈해몽 목록</CardTitle>
            <CardDescription>
              {filterStatus === "all" ? "전체" : filterStatus === "published" ? "발행된" : "임시저장"} {filteredDreams.length}개
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">로딩 중...</div>
            ) : filteredDreams.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-lg mb-2">꿈해몽이 없습니다</p>
                <p className="text-sm">새 꿈해몽을 작성해보세요.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[25%]">키워드</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>등급</TableHead>
                      <TableHead>점수</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDreams.map((dream: any) => (
                      <TableRow key={dream.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{dream.keyword}</p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                              {dream.interpretation?.slice(0, 50)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryLabel(dream.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeBadgeClass(dream.grade)}`}>
                            {getGradeLabel(dream.grade)}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-700 font-medium">
                          {dream.score}점
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              dream.published
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {dream.published ? "발행됨" : "임시저장"}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {new Date(dream.created_at).toLocaleDateString("ko-KR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            {dream.published && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(`https://muunsaju.com/dream/${dream.slug}`, "_blank")
                                }
                                title="사이트에서 보기"
                              >
                                <Eye className="w-4 h-4 text-slate-400" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/dreams/${dream.id}/edit`)}
                              title="편집"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(dream.id, dream.keyword)}
                              disabled={deleteDreamMutation.isPending}
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

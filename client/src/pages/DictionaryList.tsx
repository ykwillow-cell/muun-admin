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
import { Edit2, Trash2, Plus, Search, BookOpen, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useDictionaryList, useDeleteDictionary } from "@/lib/queries";
import { DICTIONARY_CATEGORY_OPTIONS } from "@/lib/supabase";
import { toast } from "sonner";

export default function DictionaryList() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const { data: items = [], isLoading } = useDictionaryList();
  const deleteMutation = useDeleteDictionary();

  const filtered = items.filter((item: any) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.summary || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && item.published) ||
      (filterStatus === "draft" && !item.published);
    const matchCategory =
      filterCategory === "all" || item.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`"${title}" 항목을 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("운세 사전 항목이 삭제되었습니다.");
      } catch {
        toast.error("삭제에 실패했습니다.");
      }
    }
  };

  const publishedCount = items.filter((d: any) => d.published).length;
  const draftCount = items.length - publishedCount;

  const getCategoryLabel = (cat: string) =>
    DICTIONARY_CATEGORY_OPTIONS.find((c) => c.value === cat)?.label || cat;

  const statusFilters = [
    { key: "all", label: "전체", count: items.length },
    { key: "published", label: "발행됨", count: publishedCount },
    { key: "draft", label: "임시저장", count: draftCount },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            홈
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900">운세 사전 관리</h1>
          </div>
          <div className="ml-auto">
            <Button onClick={() => setLocation("/dictionary/new")} size="sm" className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4" />
              새 항목 추가
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">전체</p>
                  <p className="text-2xl font-bold text-slate-900">{items.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-amber-500 opacity-30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">발행됨</p>
                  <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-500 opacity-30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">임시저장</p>
                  <p className="text-2xl font-bold text-yellow-600">{draftCount}</p>
                </div>
                <BookOpen className="w-8 h-8 text-yellow-500 opacity-30" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4">
              {/* 검색 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="제목 또는 요약으로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* 상태 필터 태그 */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-500 self-center mr-1">상태:</span>
                {statusFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilterStatus(f.key as any)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      filterStatus === f.key
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-white text-slate-600 border-slate-300 hover:border-amber-400"
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              {/* 카테고리 필터 태그 */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-500 self-center mr-1">카테고리:</span>
                <button
                  onClick={() => setFilterCategory("all")}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    filterCategory === "all"
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-300 hover:border-slate-500"
                  }`}
                >
                  전체
                </button>
                {DICTIONARY_CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterCategory(opt.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      filterCategory === opt.value
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-white text-slate-600 border-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">로딩 중...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {search || filterStatus !== "all" || filterCategory !== "all"
                  ? "검색 결과가 없습니다."
                  : "등록된 운세 사전 항목이 없습니다."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead className="w-28">카테고리</TableHead>
                    <TableHead className="w-24">태그</TableHead>
                    <TableHead className="w-24">상태</TableHead>
                    <TableHead className="w-28">등록일</TableHead>
                    <TableHead className="w-20 text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.summary}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs border border-amber-200">
                          {getCategoryLabel(item.category)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(item.tags || []).slice(0, 2).map((tag: string) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {(item.tags || []).length > 2 && (
                            <span className="text-xs text-slate-400">+{item.tags.length - 2}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.published ? "발행됨" : "임시저장"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleDateString("ko-KR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/dictionary/${item.id}/edit`)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id, item.title)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

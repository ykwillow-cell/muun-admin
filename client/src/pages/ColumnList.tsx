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
import { Edit2, Trash2, Plus, Search, Globe, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { useColumnsList, useDeleteColumn } from "@/lib/queries";
import { CATEGORY_OPTIONS } from "@/lib/supabase";
import { toast } from "sonner";

export default function ColumnList() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");

  const { data: columns = [], isLoading } = useColumnsList();
  const deleteColumnMutation = useDeleteColumn();

  const filteredColumns = columns.filter((col: any) => {
    const title = col.title || col.name || "";
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && col.published) ||
      (filterStatus === "draft" && !col.published);
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`"${title}" 칼럼을 삭제하시겠습니까?`)) {
      try {
        await deleteColumnMutation.mutateAsync(id);
        toast.success("칼럼이 삭제되었습니다.");
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error("삭제에 실패했습니다.");
      }
    }
  };

  const publishedCount = columns.filter((c: any) => c.published).length;
  const draftCount = columns.length - publishedCount;

  const getCategoryLabel = (category: string) =>
    CATEGORY_OPTIONS.find((c) => c.value === category)?.label || category;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">칼럼 관리</h1>
            <p className="text-slate-600">muunsaju.com/guide에 노출되는 칼럼을 관리하세요</p>
          </div>
          <Button onClick={() => setLocation("/columns/new")} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            새 칼럼 작성
          </Button>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setFilterStatus("all")}
            className={`bg-white rounded-lg border p-4 text-left transition-colors ${filterStatus === "all" ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200 hover:border-slate-300"}`}
          >
            <p className="text-sm text-slate-500">전체</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{columns.length}</p>
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

        {/* 검색 */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="칼럼 제목으로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 칼럼 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>칼럼 목록</CardTitle>
            <CardDescription>
              {filterStatus === "all" ? "전체" : filterStatus === "published" ? "발행된" : "임시저장"} {filteredColumns.length}개
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">로딩 중...</div>
            ) : filteredColumns.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-lg mb-2">칼럼이 없습니다</p>
                <p className="text-sm">새 칼럼을 작성해보세요.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">제목</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredColumns.map((column: any) => {
                      const title = column.title || column.name || "(제목 없음)";
                      return (
                        <TableRow key={column.id} className="hover:bg-slate-50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900 truncate max-w-xs">
                                {title}
                              </p>
                              {column.description && (
                                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
                                  {column.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryLabel(column.category || "luck")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                column.published
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {column.published ? "발행됨" : "임시저장"}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm">
                            {new Date(column.created_at).toLocaleDateString("ko-KR")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              {column.published && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    window.open("https://muunsaju.com/guide", "_blank")
                                  }
                                  title="사이트에서 보기"
                                >
                                  <Eye className="w-4 h-4 text-slate-400" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setLocation(`/columns/${column.id}/edit`)
                                }
                                title="편집"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(column.id, title)}
                                disabled={deleteColumnMutation.isPending}
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

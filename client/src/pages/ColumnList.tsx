import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2, Plus, Search } from "lucide-react";
import { useLocation } from "wouter";

/**
 * 칼럼 목록 페이지
 * 관리자가 작성된 모든 칼럼을 보고 관리하는 페이지
 */
export default function ColumnList() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [published, setPublished] = useState<boolean | undefined>();

  // 칼럼 목록 조회
  const { data: columnData, isLoading } = trpc.columns.list.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    category: category || undefined,
    published,
  });

  // 카테고리 목록 조회
  const { data: categories = [] } = trpc.categories.list.useQuery();

  // 칼럼 삭제
  const deleteColumnMutation = trpc.columns.delete.useMutation({
    onSuccess: () => {
      // 목록 새로고침
      window.location.reload();
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("이 칼럼을 삭제하시겠습니까?")) {
      deleteColumnMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">칼럼 관리</h1>
          <p className="text-gray-600 mt-1">작성된 모든 칼럼을 보고 관리하세요.</p>
        </div>
        <Button
          onClick={() => setLocation("/admin/columns/new")}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          새 칼럼 작성
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 검색 */}
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-600" />
              <Input
                placeholder="칼럼 제목으로 검색..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* 카테고리 필터 */}
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 발행 상태 필터 */}
            <Select
              value={published === undefined ? "all" : published ? "published" : "draft"}
              onValueChange={(value) => {
                if (value === "all") {
                  setPublished(undefined);
                } else {
                  setPublished(value === "published");
                }
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="published">발행됨</SelectItem>
                <SelectItem value="draft">임시저장</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 칼럼 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>칼럼 목록</CardTitle>
          <CardDescription>
            총 {columnData?.total || 0}개의 칼럼 ({columnData?.page || 1} /
            {columnData?.totalPages || 1})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">로드 중...</div>
          ) : columnData?.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">칼럼이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작성일</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columnData?.items.map((column) => (
                    <TableRow key={column.id}>
                      <TableCell className="font-medium">{column.title}</TableCell>
                      <TableCell>{column.category}</TableCell>
                      <TableCell>{column.author}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            column.published
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {column.published ? "발행됨" : "임시저장"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(column.createdAt).toLocaleDateString("ko-KR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/admin/columns/${column.id}/edit`)}
                            title="편집"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(column.id)}
                            title="삭제"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* 페이지네이션 */}
          {columnData && columnData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                이전
              </Button>
              <span className="text-sm text-gray-600">
                {page} / {columnData.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(columnData.totalPages, page + 1))}
                disabled={page === columnData.totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

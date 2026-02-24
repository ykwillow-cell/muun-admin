import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useColumnsList, useDeleteColumn } from "@/lib/queries";

/**
 * 칼럼 목록 페이지
 * 관리자가 작성된 모든 칼럼을 보고 관리하는 페이지
 */
export default function ColumnList() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  // 칼럼 목록 조회
  const { data: columns = [], isLoading } = useColumnsList();

  // 칼럼 삭제
  const deleteColumnMutation = useDeleteColumn();

  // 검색 필터링
  const filteredColumns = columns.filter((col: any) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteColumnMutation.mutateAsync(id);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">칼럼 관리</h1>
          <p className="text-slate-600">작성된 모든 칼럼을 관리하세요</p>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="칼럼 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setLocation("/columns/new")} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            새 칼럼 작성
          </Button>
        </div>

        {/* 칼럼 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>칼럼 목록</CardTitle>
            <CardDescription>
              총 {filteredColumns.length}개의 칼럼
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">로딩 중...</div>
            ) : filteredColumns.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                작성한 칼럼이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredColumns.map((column: any) => (
                      <TableRow key={column.id}>
                        <TableCell className="font-medium">
                          {column.name}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              column.published
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {column.published ? "발행됨" : "임시저장"}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {new Date(column.created_at).toLocaleDateString(
                            "ko-KR"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setLocation(`/columns/${column.id}/edit`)
                              }
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(column.id)}
                              disabled={deleteColumnMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
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

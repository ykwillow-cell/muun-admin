import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  useColumn,
  useCreateColumn,
  useUpdateColumn,
} from "@/lib/queries";

/**
 * 칼럼 작성/편집 페이지
 * 새 칼럼을 작성하거나 기존 칼럼을 편집하는 페이지
 */
export default function ColumnEditor() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const columnId = params?.id;

  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 기존 칼럼 조회 (편집 모드)
  const { data: column, isLoading: isLoadingColumn } = useColumn(columnId || "");

  // 칼럼 생성
  const createMutation = useCreateColumn();

  // 칼럼 업데이트
  const updateMutation = useUpdateColumn();

  // 기존 칼럼 데이터 로드
  useEffect(() => {
    if (column) {
      setName(column.name);
    }
  }, [column]);

  const handleSave = async () => {
    if (!name) {
      alert("칼럼 이름을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      if (columnId) {
        // 기존 칼럼 업데이트
        await updateMutation.mutateAsync({
          id: columnId,
          name,
        });
      } else {
        // 새 칼럼 생성
        await createMutation.mutateAsync(name);
      }
      setLocation("/columns");
    } catch (error) {
      console.error("Save failed:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingColumn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* 뒤로가기 */}
        <button
          onClick={() => setLocation("/columns")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          칼럼 목록으로 돌아가기
        </button>

        {/* 편집 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {columnId ? "칼럼 편집" : "새 칼럼 작성"}
            </CardTitle>
            <CardDescription>
              {columnId
                ? "기존 칼럼의 정보를 수정하세요"
                : "새로운 칼럼을 작성하세요"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 칼럼 이름 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  칼럼 이름 *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="칼럼 이름을 입력하세요"
                  disabled={isSaving}
                />
              </div>

              {/* 저장 버튼 */}
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !name}
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    "저장하기"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/columns")}
                  disabled={isSaving}
                  size="lg"
                >
                  취소
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

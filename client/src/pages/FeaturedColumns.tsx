import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Star,
  Loader2,
  X,
  Check,
  ExternalLink,
  Info,
} from "lucide-react";
import { columnApi, featuredApi, type Column, type FeaturedColumn } from "@/lib/supabase";
import { CATEGORY_OPTIONS } from "@/lib/supabase";
import { toast } from "sonner";

const POSITIONS = [1, 2, 3] as const;

export default function FeaturedColumns() {
  const [, setLocation] = useLocation();
  const [allColumns, setAllColumns] = useState<Column[]>([]);
  const [featured, setFeatured] = useState<(FeaturedColumn | null)[]>([null, null, null]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectingPosition, setSelectingPosition] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cols, feats] = await Promise.all([
        columnApi.getAll(),
        featuredApi.getAll(),
      ]);
      setAllColumns(cols.filter((c) => c.published));
      // position 1~3 슬롯에 맞게 배치
      const slots: (FeaturedColumn | null)[] = [null, null, null];
      feats.forEach((f) => {
        if (f.position >= 1 && f.position <= 3) {
          slots[f.position - 1] = f;
        }
      });
      setFeatured(slots);
    } catch (err) {
      toast.error("데이터를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectColumn = async (position: number, column: Column) => {
    setIsSaving(true);
    try {
      await featuredApi.setFeatured(position, column.id);
      toast.success(`${position}번 슬롯에 칼럼이 설정되었습니다.`);
      await loadData();
      setSelectingPosition(null);
      setSearchQuery("");
    } catch (err) {
      toast.error("설정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (position: number) => {
    setIsSaving(true);
    try {
      await featuredApi.removeFeatured(position);
      toast.success(`${position}번 슬롯이 비워졌습니다.`);
      await loadData();
    } catch (err) {
      toast.error("제거에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryLabel = (category: string) =>
    CATEGORY_OPTIONS.find((c) => c.value === category)?.label || category;

  const filteredColumns = allColumns.filter((c) => {
    const title = c.title || c.name || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">홈으로</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h1 className="text-lg font-semibold text-slate-900">
                메인화면 추천 칼럼
              </h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://muunsaju.com", "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            사이트 확인
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">muunsaju.com 메인화면 하단 "최신 운세 칼럼" 섹션에 노출될 칼럼 3개를 선택합니다.</p>
            <p className="text-blue-600">발행된 칼럼 중에서만 선택할 수 있습니다. 슬롯을 비워두면 해당 위치에는 최신 칼럼이 자동으로 표시됩니다.</p>
          </div>
        </div>

        {/* 슬롯 3개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {POSITIONS.map((pos) => {
            const slot = featured[pos - 1];
            const col = slot?.column as Column | undefined;
            const isSelecting = selectingPosition === pos;

            return (
              <Card key={pos} className={`relative ${isSelecting ? "ring-2 ring-blue-500" : ""}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">
                        {pos}
                      </span>
                      슬롯 {pos}
                    </span>
                    {col && (
                      <button
                        onClick={() => handleRemove(pos)}
                        disabled={isSaving}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="슬롯 비우기"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {col ? (
                    <div className="space-y-2">
                      {col.thumbnail_url && (
                        <div className="aspect-video rounded overflow-hidden bg-slate-100">
                          <img
                            src={col.thumbnail_url}
                            alt="썸네일"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <Badge variant="secondary" className="text-xs mb-1">
                          {getCategoryLabel(col.category)}
                        </Badge>
                        <p className="text-sm font-medium text-slate-900 line-clamp-2">
                          {col.title || col.name}
                        </p>
                        {col.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {col.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectingPosition(pos);
                          setSearchQuery("");
                        }}
                      >
                        칼럼 변경
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        setSelectingPosition(pos);
                        setSearchQuery("");
                      }}
                    >
                      <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">칼럼 선택하기</p>
                      <p className="text-xs text-slate-400 mt-1">클릭하여 칼럼 지정</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 칼럼 선택 패널 */}
        {selectingPosition !== null && (
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  슬롯 {selectingPosition}에 표시할 칼럼 선택
                </CardTitle>
                <button
                  onClick={() => {
                    setSelectingPosition(null);
                    setSearchQuery("");
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                placeholder="칼럼 제목으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-2 w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </CardHeader>
            <CardContent className="p-0">
              {filteredColumns.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  {allColumns.length === 0
                    ? "발행된 칼럼이 없습니다. 먼저 칼럼을 발행해주세요."
                    : "검색 결과가 없습니다."}
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                  {filteredColumns.map((col) => {
                    const isCurrentlyFeatured = featured.some(
                      (f) => f?.column_id === col.id
                    );
                    const isCurrentSlot =
                      featured[selectingPosition - 1]?.column_id === col.id;

                    return (
                      <div
                        key={col.id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                          isCurrentSlot ? "bg-blue-50" : ""
                        }`}
                        onClick={() =>
                          !isSaving && handleSelectColumn(selectingPosition, col)
                        }
                      >
                        {col.thumbnail_url ? (
                          <img
                            src={col.thumbnail_url}
                            alt=""
                            className="w-14 h-10 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-10 bg-slate-100 rounded flex-shrink-0 flex items-center justify-center">
                            <Star className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant="secondary" className="text-xs py-0">
                              {getCategoryLabel(col.category)}
                            </Badge>
                            {isCurrentlyFeatured && !isCurrentSlot && (
                              <span className="text-xs text-orange-500">
                                다른 슬롯에 설정됨
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {col.title || col.name}
                          </p>
                        </div>
                        {isCurrentSlot ? (
                          <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        ) : isSaving ? (
                          <Loader2 className="w-4 h-4 text-slate-400 animate-spin flex-shrink-0" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 현재 설정 요약 */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">현재 설정 요약</h3>
          <div className="space-y-2">
            {POSITIONS.map((pos) => {
              const slot = featured[pos - 1];
              const col = slot?.column as Column | undefined;
              return (
                <div key={pos} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {pos}
                  </span>
                  {col ? (
                    <span className="text-slate-700 truncate">
                      {col.title || col.name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">미설정 (최신 칼럼 자동 표시)</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

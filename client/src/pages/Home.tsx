import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Star, Moon } from "lucide-react";
import { useColumnsList, useDreamsList } from "@/lib/queries";
import { useAuth } from "@/lib/queries";
import Login from "./Login";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: columns = [], isLoading: isLoadingColumns } = useColumnsList();
  const { data: dreams = [], isLoading: isLoadingDreams } = useDreamsList();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const publishedCount = columns.filter((c: any) => c.published).length;
  const draftCount = columns.length - publishedCount;
  const publishedDreamsCount = dreams.filter((d: any) => d.published).length;
  const draftDreamsCount = dreams.length - publishedDreamsCount;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">MUUN Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <Button onClick={logout} variant="outline" size="sm">
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">전체 칼럼</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {isLoadingColumns ? "-" : columns.length}
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">발행된 칼럼</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {isLoadingColumns ? "-" : publishedCount}
                </p>
              </div>
              <FileText className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">임시저장 칼럼</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {isLoadingColumns ? "-" : draftCount}
                </p>
              </div>
              <FileText className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* 꿈해몽 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">전체 꿈해몽</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {isLoadingDreams ? "-" : dreams.length}
                </p>
              </div>
              <Moon className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">발행된 꿈해몽</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {isLoadingDreams ? "-" : publishedDreamsCount}
                </p>
              </div>
              <Moon className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">임시저장 꿈해몽</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {isLoadingDreams ? "-" : draftDreamsCount}
                </p>
              </div>
              <Moon className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* 칼럼 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">최근 칼럼</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setLocation("/featured")}
                size="sm"
                className="flex items-center gap-1"
              >
                <Star className="w-4 h-4 text-yellow-500" />
                메인 추천 칼럼
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/dreams")}
                size="sm"
                className="flex items-center gap-1"
              >
                <Moon className="w-4 h-4 text-purple-500" />
                꿈해몽 관리
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/columns")}
                size="sm"
              >
                전체 보기
              </Button>
              <Button onClick={() => setLocation("/columns/new")} size="sm">
                새 칼럼 작성
              </Button>
            </div>
          </div>
          <div className="divide-y divide-slate-200">
            {isLoadingColumns ? (
              <div className="p-6 text-center text-slate-500">로딩 중...</div>
            ) : columns.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                작성한 칼럼이 없습니다.
              </div>
            ) : (
              columns.slice(0, 10).map((column: any) => {
                const title = column.title || column.name || "(제목 없음)";
                return (
                  <div
                    key={column.id}
                    className="p-6 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setLocation(`/columns/${column.id}/edit`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{title}</h3>
                        {column.description && (
                          <p className="text-sm text-slate-500 mt-1 truncate max-w-lg">
                            {column.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(column.created_at).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <span
                        className={`ml-4 px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${
                          column.published
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {column.published ? "발행됨" : "임시저장"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

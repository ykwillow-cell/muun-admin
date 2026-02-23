import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Users, Settings } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Login from "./Login";

/**
 * Home Page - 로그인 여부에 따라 다른 콘텐츠 표시
 * - 미인증: 로그인 페이지
 * - 인증됨: 대시보드
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  // 칼럼 통계 조회
  const { data: columnStats } = trpc.columns.list.useQuery(
    { limit: 1000 },
    { enabled: isAuthenticated }
  );

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  // 미인증 - 로그인 페이지 표시
  if (!isAuthenticated) {
    return <Login />;
  }

  // 인증됨 - 대시보드 표시
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">MUUN Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user?.name || user?.email}
            </span>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">전체 칼럼</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {columnStats?.total || 0}
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">발행된 칼럼</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {columnStats?.items?.filter((c: any) => c.published).length || 0}
                </p>
              </div>
              <FileText className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">임시저장</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {columnStats?.items?.filter((c: any) => !c.published).length || 0}
                </p>
              </div>
              <FileText className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* 메뉴 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 칼럼 관리 */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/columns")}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  칼럼 관리
                </h2>
                <p className="text-slate-600 mb-4">
                  칼럼을 작성하고 관리합니다
                </p>
              </div>
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <Button variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); setLocation("/columns"); }}>
              관리하기
            </Button>
          </div>

          {/* 사용자 관리 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  사용자 관리
                </h2>
                <p className="text-slate-600 mb-4">
                  시스템 사용자를 관리합니다
                </p>
              </div>
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <Button variant="outline" className="w-full" disabled>
              준비 중
            </Button>
          </div>

          {/* 설정 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  설정
                </h2>
                <p className="text-slate-600 mb-4">
                  시스템 설정을 관리합니다
                </p>
              </div>
              <Settings className="w-6 h-6 text-gray-500" />
            </div>
            <Button variant="outline" className="w-full" disabled>
              준비 중
            </Button>
          </div>
        </div>

        {/* 사용자 정보 섹션 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            사용자 정보
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">이름</p>
              <p className="text-slate-900 font-medium">{user?.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">이메일</p>
              <p className="text-slate-900 font-medium">{user?.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">역할</p>
              <p className="text-slate-900 font-medium">
                {user?.role === "admin" ? "관리자" : "사용자"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">ID</p>
              <p className="text-slate-900 font-medium text-xs">{user?.id || "-"}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

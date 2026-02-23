import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import Login from "./Login";

/**
 * Home Page - 로그인 여부에 따라 다른 콘텐츠 표시
 * - 미인증: 로그인 페이지
 * - 인증됨: 대시보드
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 대시보드 카드 예시 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              사용자 관리
            </h2>
            <p className="text-slate-600 mb-4">
              시스템 사용자를 관리합니다
            </p>
            <Button variant="outline" className="w-full">
              관리하기
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              설정
            </h2>
            <p className="text-slate-600 mb-4">
              시스템 설정을 관리합니다
            </p>
            <Button variant="outline" className="w-full">
              설정하기
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              로그
            </h2>
            <p className="text-slate-600 mb-4">
              시스템 로그를 확인합니다
            </p>
            <Button variant="outline" className="w-full">
              보기
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

import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";
import Login from "@/pages/Login";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

/**
 * ProtectedRoute - 인증이 필요한 라우트
 * 로그인하지 않은 사용자는 Login 페이지로 리다이렉트
 * 특정 역할이 필요한 경우 역할 확인
 */
export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  // 인증되지 않음
  if (!isAuthenticated) {
    return <Login />;
  }

  // 역할 확인 (필요한 경우)
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            접근 거부
          </h1>
          <p className="text-slate-600">
            이 페이지에 접근할 권한이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

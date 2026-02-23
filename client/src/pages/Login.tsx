import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";

/**
 * Login Page - Manus OAuth 로그인
 * 사용자가 로그인하지 않은 경우 이 페이지로 리다이렉트됨
 */
export default function Login() {
  const loginUrl = getLoginUrl();

  useEffect(() => {
    // 자동 리다이렉트 (선택사항)
    // window.location.href = loginUrl;
  }, [loginUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        {/* 로고 또는 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            MUUN Admin
          </h1>
          <p className="text-slate-600">관리자 시스템에 로그인하세요</p>
        </div>

        {/* 로그인 버튼 */}
        <Button
          onClick={() => (window.location.href = loginUrl)}
          className="w-full h-12 text-lg font-semibold"
          variant="default"
        >
          Manus로 로그인
        </Button>

        {/* 추가 정보 */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>Manus 계정으로 안전하게 로그인하세요</p>
        </div>
      </div>
    </div>
  );
}

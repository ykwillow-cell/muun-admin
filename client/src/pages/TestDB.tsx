import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestDB() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Check if we can connect to Supabase
        const { data: columns, error } = await supabase
          .from("columns")
          .select("*")
          .limit(1);

        if (error) {
          setStatus("error");
          setMessage(`Error: ${error.message}`);
          return;
        }

        setStatus("success");
        setMessage(`✅ Supabase 연결 성공! 테이블에 ${columns?.length || 0}개의 행이 있습니다.`);
        setData(columns);
      } catch (err) {
        setStatus("error");
        setMessage(`Exception: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Supabase 연결 테스트
        </h1>

        <div
          className={`p-6 rounded-lg border-2 ${
            status === "success"
              ? "bg-green-50 border-green-200"
              : status === "error"
              ? "bg-red-50 border-red-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <p
            className={`text-lg font-semibold ${
              status === "success"
                ? "text-green-800"
                : status === "error"
                ? "text-red-800"
                : "text-blue-800"
            }`}
          >
            {status === "loading" ? "테스트 중..." : message}
          </p>

          {data && (
            <pre className="mt-4 bg-white p-4 rounded border border-slate-200 text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg border border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-2">환경변수 확인:</h2>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>
              VITE_SUPABASE_URL:{" "}
              {import.meta.env.VITE_SUPABASE_URL ? "✅" : "❌"}
            </li>
            <li>
              VITE_SUPABASE_ANON_KEY:{" "}
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅" : "❌"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

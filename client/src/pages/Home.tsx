import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Loader2,
  Star,
  Moon,
  BookOpen,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import { useColumnsList, useDreamsList, useDictionaryList, useAuth } from "@/lib/queries";
import Login from "./Login";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: columns = [], isLoading: isLoadingColumns } = useColumnsList();
  const { data: dreams = [], isLoading: isLoadingDreams } = useDreamsList();
  const { data: dictionary = [], isLoading: isLoadingDictionary } = useDictionaryList();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // 통계 계산
  const publishedColumns = columns.filter((c: any) => c.published).length;
  const draftColumns = columns.length - publishedColumns;
  const publishedDreams = dreams.filter((d: any) => d.published).length;
  const draftDreams = dreams.length - publishedDreams;
  const publishedDictionary = dictionary.filter((d: any) => d.published).length;
  const draftDictionary = dictionary.length - publishedDictionary;

  // 최근 항목 (최신 3개씩)
  const recentColumns = [...columns].slice(0, 3);
  const recentDreams = [...dreams].slice(0, 3);
  const recentDictionary = [...dictionary].slice(0, 3);

  const totalContent = columns.length + dreams.length + dictionary.length;
  const totalPublished = publishedColumns + publishedDreams + publishedDictionary;

  const menus = [
    {
      key: "column",
      icon: FileText,
      color: "blue",
      title: "운세 칼럼",
      description: "전문 칼럼 콘텐츠 관리",
      total: columns.length,
      published: publishedColumns,
      draft: draftColumns,
      listPath: "/columns",
      newPath: "/columns/new",
      isLoading: isLoadingColumns,
      recentItems: recentColumns,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      tagColor: "bg-blue-600",
      borderColor: "border-blue-200",
      accentBg: "bg-blue-50",
    },
    {
      key: "dream",
      icon: Moon,
      color: "purple",
      title: "꿈해몽",
      description: "꿈 풀이 콘텐츠 관리",
      total: dreams.length,
      published: publishedDreams,
      draft: draftDreams,
      listPath: "/dreams",
      newPath: "/dreams/new",
      isLoading: isLoadingDreams,
      recentItems: recentDreams,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      tagColor: "bg-purple-600",
      borderColor: "border-purple-200",
      accentBg: "bg-purple-50",
    },
    {
      key: "dictionary",
      icon: BookOpen,
      color: "amber",
      title: "운세 사전",
      description: "운세 용어 사전 관리",
      total: dictionary.length,
      published: publishedDictionary,
      draft: draftDictionary,
      listPath: "/dictionary",
      newPath: "/dictionary/new",
      isLoading: isLoadingDictionary,
      recentItems: recentDictionary,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      tagColor: "bg-amber-600",
      borderColor: "border-amber-200",
      accentBg: "bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">MUUN Admin</h1>
              <p className="text-xs text-slate-400 mt-0.5">무운 콘텐츠 관리 시스템</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">{user?.email}</span>
            <Button onClick={logout} variant="outline" size="sm">
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 전체 요약 배너 */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-slate-300 text-sm mb-1">전체 콘텐츠 현황</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">{totalContent}</span>
                <span className="text-slate-300 text-sm">개 항목</span>
                <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {totalPublished}개 발행됨
                </span>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-300">{columns.length}</p>
                <p className="text-xs text-slate-400 mt-0.5">칼럼</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-300">{dreams.length}</p>
                <p className="text-xs text-slate-400 mt-0.5">꿈해몽</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-300">{dictionary.length}</p>
                <p className="text-xs text-slate-400 mt-0.5">운세 사전</p>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">빠른 작성</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setLocation("/columns/new")}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">새 칼럼 작성</p>
                <p className="text-xs text-slate-400">운세 칼럼 콘텐츠</p>
              </div>
            </button>
            <button
              onClick={() => setLocation("/dreams/new")}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-purple-300 hover:bg-purple-50 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100">
                <Plus className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">새 꿈해몽 추가</p>
                <p className="text-xs text-slate-400">꿈 풀이 콘텐츠</p>
              </div>
            </button>
            <button
              onClick={() => setLocation("/dictionary/new")}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-amber-300 hover:bg-amber-50 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100">
                <Plus className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">새 사전 항목</p>
                <p className="text-xs text-slate-400">운세 용어 사전</p>
              </div>
            </button>
          </div>
        </div>

        {/* 3개 메뉴 관리 카드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {menus.map((menu) => {
            const Icon = menu.icon;
            return (
              <Card key={menu.key} className="overflow-hidden hover:shadow-md transition-shadow">
                {/* 카드 헤더 */}
                <div className={`${menu.accentBg} px-5 py-4 border-b ${menu.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${menu.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${menu.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{menu.title}</h3>
                        <p className="text-xs text-slate-500">{menu.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setLocation(menu.newPath)}
                      className={`w-7 h-7 rounded-full ${menu.tagColor} text-white flex items-center justify-center hover:opacity-80 transition-opacity`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* 통계 */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center bg-slate-50 rounded-lg py-2">
                      <p className="text-xl font-bold text-slate-900">
                        {menu.isLoading ? "-" : menu.total}
                      </p>
                      <p className="text-xs text-slate-500">전체</p>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg py-2">
                      <p className="text-xl font-bold text-green-600">
                        {menu.isLoading ? "-" : menu.published}
                      </p>
                      <p className="text-xs text-slate-500">발행</p>
                    </div>
                    <div className="text-center bg-yellow-50 rounded-lg py-2">
                      <p className="text-xl font-bold text-yellow-600">
                        {menu.isLoading ? "-" : menu.draft}
                      </p>
                      <p className="text-xs text-slate-500">임시</p>
                    </div>
                  </div>

                  {/* 최근 항목 */}
                  <div className="space-y-1.5 mb-4">
                    <p className="text-xs font-medium text-slate-400 flex items-center gap-1 mb-2">
                      <Clock className="w-3 h-3" />
                      최근 항목
                    </p>
                    {menu.isLoading ? (
                      <div className="text-xs text-slate-400 py-2">로딩 중...</div>
                    ) : menu.recentItems.length === 0 ? (
                      <div className="text-xs text-slate-400 py-2">항목이 없습니다.</div>
                    ) : (
                      menu.recentItems.map((item: any) => (
                        <button
                          key={item.id}
                          onClick={() => setLocation(`${menu.listPath}/${item.id}/edit`)}
                          className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors group text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Edit3 className="w-3 h-3 text-slate-300 flex-shrink-0" />
                            <span className="text-xs text-slate-700 truncate">
                              {item.title || item.keyword || item.name || "(제목 없음)"}
                            </span>
                          </div>
                          <span
                            className={`flex-shrink-0 ml-2 px-1.5 py-0.5 rounded text-xs ${
                              item.published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {item.published ? "발행" : "임시"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>

                  {/* 전체 보기 버튼 */}
                  <button
                    onClick={() => setLocation(menu.listPath)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                    전체 목록 보기
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 메인 추천 칼럼 바로가기 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">메인 추천 칼럼</h3>
              <p className="text-xs text-slate-500">무운 메인 페이지에 노출되는 추천 칼럼을 관리합니다.</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/featured")}
            className="flex items-center gap-1.5 flex-shrink-0"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            관리하기
          </Button>
        </div>
      </main>
    </div>
  );
}

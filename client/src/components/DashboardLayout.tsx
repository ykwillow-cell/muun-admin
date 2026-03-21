import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Image,
  LayoutDashboard,
  LogOut,
  Moon,
  Palette,
  Sparkles,
  Star,
  Type,
  Menu,
  X,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const contentMenuItems = [
  { icon: LayoutDashboard, label: "대시보드", path: "/" },
  { icon: BookOpen, label: "칼럼 관리", path: "/columns" },
  { icon: Star, label: "추천 칼럼", path: "/featured" },
  { icon: Moon, label: "꿈해몽 관리", path: "/dreams" },
  { icon: Sparkles, label: "사주 사전", path: "/dictionary" },
];

const designMenuItems = [
  { icon: Palette, label: "테마 관리", path: "/design/themes" },
  { icon: Type, label: "타이포그래피", path: "/design/typography" },
  { icon: Image, label: "배너 관리", path: "/banners" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";
const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isCollapsed.toString());
  }, [isCollapsed]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Sign in to continue
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Access to this dashboard requires authentication. Continue to
              launch the login flow.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayoutContent
      sidebarWidth={sidebarWidth}
      setSidebarWidth={setSidebarWidth}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      {children}
    </DashboardLayoutContent>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
};

function DashboardLayoutContent({
  children,
  sidebarWidth,
  setSidebarWidth,
  isCollapsed,
  setIsCollapsed,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isResizing, setIsResizing] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const allMenuItems = [...contentMenuItems, ...designMenuItems];
  const activeMenuItem = allMenuItems.find(
    (item) =>
      item.path === location ||
      (item.path !== "/" && location.startsWith(item.path + "/")) ||
      (item.path !== "/" && location.startsWith(item.path))
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft =
        sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  // 모바일 메뉴 열릴 때 스크롤 잠금
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = mobileOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, isMobile]);

  const handleNavClick = (path: string) => {
    setLocation(path);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* 헤더 */}
      <div
        className="flex items-center h-14 px-3 border-b border-border/60 shrink-0"
        style={{ justifyContent: isCollapsed ? "center" : "space-between" }}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center shrink-0">
              <Star className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight truncate">
              무운 어드민
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground shrink-0"
            aria-label={isCollapsed ? "메뉴 펼치기" : "메뉴 접기"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {/* 콘텐츠 관리 */}
        <div>
          {!isCollapsed && (
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
              콘텐츠 관리
            </p>
          )}
          {isCollapsed && <div className="h-px bg-border/60 mx-1 mb-2" />}
          <ul className="space-y-0.5">
            {contentMenuItems.map((item) => {
              const isActive =
                location === item.path ||
                (item.path !== "/" && location.startsWith(item.path));
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavClick(item.path)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors
                      ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground/70 hover:bg-accent hover:text-foreground"
                      }
                      ${isCollapsed ? "justify-center" : ""}
                    `}
                  >
                    <item.icon
                      className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 디자인 관리 */}
        <div>
          {!isCollapsed && (
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
              디자인 관리
            </p>
          )}
          {isCollapsed && <div className="h-px bg-border/60 mx-1 mb-2" />}
          <ul className="space-y-0.5">
            {designMenuItems.map((item) => {
              const isActive =
                location === item.path || location.startsWith(item.path);
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavClick(item.path)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors
                      ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground/70 hover:bg-accent hover:text-foreground"
                      }
                      ${isCollapsed ? "justify-center" : ""}
                    `}
                  >
                    <item.icon
                      className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* 푸터 - 사용자 정보 */}
      <div className="shrink-0 border-t border-border/60 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex items-center gap-2.5 w-full rounded-md px-2 py-2 hover:bg-accent/60 transition-colors text-left focus:outline-none
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <Avatar className="h-7 w-7 border shrink-0">
                <AvatarFallback className="text-xs font-medium">
                  {user?.name?.charAt(0).toUpperCase() ?? "A"}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate leading-none">
                    {user?.name || "관리자"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {user?.email || "-"}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        {/* 모바일 상단 헤더 */}
        <header className="sticky top-0 z-40 flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur">
          <button
            onClick={() => setMobileOpen(true)}
            className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
            aria-label="메뉴 열기"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 font-semibold text-sm">
            {activeMenuItem?.label ?? "무운 어드민"}
          </span>
        </header>

        {/* 모바일 오버레이 */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-10 flex flex-col w-64 h-full bg-background border-r shadow-xl">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 right-3 h-7 w-7 flex items-center justify-center rounded hover:bg-accent"
                aria-label="메뉴 닫기"
              >
                <X className="h-4 w-4" />
              </button>
              {sidebarContent}
            </div>
          </div>
        )}

        <main className="flex-1 p-4">{children}</main>
      </div>
    );
  }

  // 데스크탑
  return (
    <div className="flex min-h-screen bg-background">
      {/* 사이드바 */}
      <div
        ref={sidebarRef}
        className="relative flex flex-col shrink-0 h-screen sticky top-0 bg-background border-r border-border/60 transition-[width] duration-200"
        style={{
          width: isCollapsed ? "56px" : `${sidebarWidth}px`,
          minWidth: isCollapsed ? "56px" : `${sidebarWidth}px`,
        } as CSSProperties}
      >
        {sidebarContent}

        {/* 리사이즈 핸들 */}
        {!isCollapsed && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/30 transition-colors"
            onMouseDown={() => setIsResizing(true)}
            style={{ zIndex: 10 }}
          />
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

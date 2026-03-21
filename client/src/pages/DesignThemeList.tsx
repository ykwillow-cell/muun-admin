import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useDesignThemeList,
  useActivateDesignTheme,
  useDuplicateDesignTheme,
  useDeleteDesignTheme,
} from "@/lib/queries";
import { type DesignTheme } from "@/lib/supabase";
import {
  CheckCircle2,
  Copy,
  Edit,
  Palette,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function DesignThemeList() {
  const [, setLocation] = useLocation();
  const { data: themes = [], isLoading } = useDesignThemeList();
  const activateMutation = useActivateDesignTheme();
  const duplicateMutation = useDuplicateDesignTheme();
  const deleteMutation = useDeleteDesignTheme();
  const [deleteTarget, setDeleteTarget] = useState<DesignTheme | null>(null);
  const [activateTarget, setActivateTarget] = useState<DesignTheme | null>(null);

  const handleActivate = async (theme: DesignTheme) => {
    try {
      await activateMutation.mutateAsync(theme.id);
      toast.success(`"${theme.name}" 테마가 활성화되었습니다.`);
      setActivateTarget(null);
    } catch {
      toast.error("테마 활성화에 실패했습니다.");
    }
  };

  const handleDuplicate = async (theme: DesignTheme) => {
    try {
      await duplicateMutation.mutateAsync(theme.id);
      toast.success(`"${theme.name}" 테마가 복제되었습니다.`);
    } catch {
      toast.error("테마 복제에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.is_active) {
      toast.error("활성화된 테마는 삭제할 수 없습니다. 다른 테마를 먼저 활성화해 주세요.");
      setDeleteTarget(null);
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" 테마가 삭제되었습니다.`);
      setDeleteTarget(null);
    } catch {
      toast.error("테마 삭제에 실패했습니다.");
    }
  };

  const activeTheme = themes.find(t => t.is_active);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              테마 관리
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              무운 사이트의 디자인 테마를 관리합니다. 활성화된 테마가 실제 사이트에 적용됩니다.
            </p>
          </div>
          <Button onClick={() => setLocation("/design/themes/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            새 테마 만들기
          </Button>
        </div>

        {/* 현재 활성 테마 요약 */}
        {activeTheme && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">현재 적용 중인 테마</CardTitle>
                </div>
                <Badge variant="default" className="gap-1">
                  <Zap className="h-3 w-3" />
                  활성
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{activeTheme.name}</p>
                  {activeTheme.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{activeTheme.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* 색상 미리보기 스와치 */}
                  <div className="flex gap-1">
                    {Object.values(activeTheme.colors).slice(0, 5).map((color, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-full border border-border shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation(`/design/themes/${activeTheme.id}/edit`)}
                    className="gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    편집
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 테마 목록 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : themes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <Palette className="h-12 w-12 text-muted-foreground/40" />
              <div className="text-center">
                <p className="font-medium text-muted-foreground">테마가 없습니다</p>
                <p className="text-sm text-muted-foreground mt-1">
                  새 테마를 만들어 사이트 디자인을 관리해 보세요.
                </p>
              </div>
              <Button onClick={() => setLocation("/design/themes/new")} className="gap-2">
                <Plus className="h-4 w-4" />
                첫 번째 테마 만들기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onEdit={() => setLocation(`/design/themes/${theme.id}/edit`)}
                onActivate={() => setActivateTarget(theme)}
                onDuplicate={() => handleDuplicate(theme)}
                onDelete={() => setDeleteTarget(theme)}
                isActivating={activateMutation.isPending}
                isDuplicating={duplicateMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* 활성화 확인 다이얼로그 */}
      <AlertDialog open={!!activateTarget} onOpenChange={() => setActivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>테마를 활성화하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{activateTarget?.name}"</strong> 테마를 활성화하면 현재 적용 중인 테마가 비활성화됩니다.
              변경 사항을 사이트에 반영하려면 이후 Vercel 재배포가 필요합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => activateTarget && handleActivate(activateTarget)}
            >
              활성화
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>테마를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deleteTarget?.name}"</strong> 테마를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

function ThemeCard({
  theme,
  onEdit,
  onActivate,
  onDuplicate,
  onDelete,
  isActivating,
  isDuplicating,
}: {
  theme: DesignTheme;
  onEdit: () => void;
  onActivate: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isActivating: boolean;
  isDuplicating: boolean;
}) {
  const colorValues = Object.values(theme.colors);
  const previewColors = colorValues.slice(0, 6);

  return (
    <Card className={`transition-all hover:shadow-md ${theme.is_active ? "border-primary/40 ring-1 ring-primary/20" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base truncate">{theme.name}</CardTitle>
              {theme.is_active && (
                <Badge variant="default" className="gap-1 shrink-0 text-xs">
                  <Zap className="h-2.5 w-2.5" />
                  활성
                </Badge>
              )}
            </div>
            {theme.description && (
              <CardDescription className="mt-1 line-clamp-2">{theme.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 색상 팔레트 미리보기 */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">색상 팔레트</p>
          <div className="flex gap-1.5 flex-wrap">
            {previewColors.map((color, i) => (
              <div
                key={i}
                className="h-7 w-7 rounded-md border border-border shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title={`${Object.keys(theme.colors)[i]}: ${color}`}
              />
            ))}
            {colorValues.length > 6 && (
              <div className="h-7 w-7 rounded-md border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                +{colorValues.length - 6}
              </div>
            )}
          </div>
        </div>

        {/* 그라디언트 미리보기 */}
        {Object.keys(theme.gradients).length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">그라디언트</p>
            <div className="flex gap-1.5">
              {Object.values(theme.gradients).slice(0, 3).map((gradient, i) => (
                <div
                  key={i}
                  className="h-7 flex-1 rounded-md border border-border shadow-sm"
                  style={{ background: gradient }}
                  title={gradient}
                />
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 gap-1.5"
          >
            <Edit className="h-3.5 w-3.5" />
            편집
          </Button>
          {!theme.is_active && (
            <Button
              size="sm"
              onClick={onActivate}
              disabled={isActivating}
              className="flex-1 gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              활성화
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            disabled={isDuplicating}
            className="px-2"
            title="복제"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          {!theme.is_active && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

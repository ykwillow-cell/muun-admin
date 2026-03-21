import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { bannerApi, Banner, BannerFormData } from "@/lib/supabase";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  AlertCircle,
  Copy,
  ChevronUp,
  ChevronDown,
  Image,
} from "lucide-react";
import { useEffect, useState } from "react";

// Supabase에서 banners 테이블 생성 SQL
const INIT_SQL = `-- Supabase SQL Editor에서 실행하세요
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  sub TEXT,
  tag TEXT,
  cta TEXT NOT NULL DEFAULT '자세히 보기',
  href TEXT NOT NULL DEFAULT '/',
  gradient TEXT NOT NULL DEFAULT 'linear-gradient(135deg, #7B61FF 0%, #6A4FE8 100%)',
  watermark TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY banners_public_read ON public.banners FOR SELECT USING (true);
CREATE POLICY banners_auth_write ON public.banners FOR ALL USING (auth.role() = 'authenticated');

-- 기본 배너 데이터
INSERT INTO public.banners (title, sub, tag, cta, href, gradient, watermark, sort_order, is_active) VALUES
  (E'올해의 운세\\n지금 확인하기', '월별 상세 · 12가지 운세 항목', '2026 병오년', '무료로 보기', '/yearly-fortune', 'linear-gradient(135deg, #7B61FF 0%, #6A4FE8 100%)', E'丙\\n午', 1, true),
  (E'가족 오행\\n함께 분석', '가족 구성원 사주 한눈에 비교', '무운에서만', '가족 사주 보기', '/family-saju', 'linear-gradient(135deg, #6A4FE8 0%, #5940CC 100%)', E'家\\n運', 2, true),
  (E'MBTI × 사주\\n궁합 분석', '성격 유형과 오행의 만남', '무운에서만', '궁합 보기', '/hybrid-compatibility', 'linear-gradient(135deg, #5940CC 0%, #4A31B0 100%)', E'合\\n命', 3, true),
  (E'아이 이름\\n사주로 짓다', '402자 검증 한자 · 81수리 성명학', '작명소', '이름 짓기', '/naming', 'linear-gradient(135deg, #4A31B0 0%, #3A2490 100%)', E'名\\n字', 4, true);`;

const EMPTY_FORM: BannerFormData = {
  title: "",
  sub: "",
  tag: "",
  cta: "자세히 보기",
  href: "/",
  gradient: "linear-gradient(135deg, #7B61FF 0%, #6A4FE8 100%)",
  watermark: "",
  sort_order: 0,
  is_active: true,
};

// 배너 미리보기 컴포넌트
function BannerPreview({ data }: { data: Partial<BannerFormData> }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: data.gradient || "linear-gradient(135deg, #7B61FF 0%, #6A4FE8 100%)",
        minHeight: "114px",
        maxHeight: "140px",
        padding: "18px",
      }}
    >
      {data.watermark && (
        <span
          className="absolute right-2.5 bottom-[-8px] text-[50px] font-black text-white/[0.13] leading-none pointer-events-none select-none text-center"
          style={{ whiteSpace: "pre-line", fontFamily: "'Noto Serif KR', serif" }}
        >
          {data.watermark}
        </span>
      )}
      <div className="relative z-10 flex flex-col gap-1.5">
        {data.tag && (
          <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wide">
            {data.tag}
          </span>
        )}
        <p
          className="text-[15px] font-extrabold text-white leading-tight m-0"
          style={{ whiteSpace: "pre-line", letterSpacing: "-0.5px" }}
        >
          {data.title || "배너 제목"}
        </p>
        {data.sub && (
          <p className="text-[11px] text-white/75 leading-relaxed m-0">
            {data.sub}
          </p>
        )}
        {data.cta && (
          <span className="inline-flex items-center mt-1 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-[12px] font-semibold text-white w-fit">
            {data.cta} →
          </span>
        )}
      </div>
    </div>
  );
}

export default function BannerList() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // 편집 다이얼로그
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // 삭제 다이얼로그
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setTableError(false);
      const data = await bannerApi.getAll();
      setBanners(data);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "";
      if (msg.includes("relation") || msg.includes("does not exist") || msg.includes("schema cache")) {
        setTableError(true);
      } else {
        toast.error("배너 목록을 불러오지 못했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sort_order: banners.length + 1 });
    setEditOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      sub: banner.sub || "",
      tag: banner.tag || "",
      cta: banner.cta,
      href: banner.href,
      gradient: banner.gradient,
      watermark: banner.watermark || "",
      sort_order: banner.sort_order,
      is_active: banner.is_active,
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!form.cta.trim()) {
      toast.error("CTA 버튼 텍스트를 입력해주세요.");
      return;
    }
    if (!form.href.trim()) {
      toast.error("링크 경로를 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await bannerApi.update(editingId, form);
        toast.success("배너가 수정되었습니다.");
      } else {
        await bannerApi.create(form);
        toast.success("배너가 생성되었습니다.");
      }
      setEditOpen(false);
      load();
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await bannerApi.delete(deleteId);
      toast.success("배너가 삭제되었습니다.");
      setDeleteId(null);
      load();
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await bannerApi.update(banner.id, { is_active: !banner.is_active });
      setBanners((prev) =>
        prev.map((b) =>
          b.id === banner.id ? { ...b, is_active: !b.is_active } : b
        )
      );
      toast.success(banner.is_active ? "배너가 비활성화되었습니다." : "배너가 활성화되었습니다.");
    } catch {
      toast.error("상태 변경 중 오류가 발생했습니다.");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newBanners = [...banners];
    [newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]];
    const updated = newBanners.map((b, i) => ({ ...b, sort_order: i + 1 }));
    setBanners(updated);
    try {
      await bannerApi.reorder(updated.map((b) => ({ id: b.id, sort_order: b.sort_order })));
    } catch {
      toast.error("순서 변경 중 오류가 발생했습니다.");
      load();
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
    const updated = newBanners.map((b, i) => ({ ...b, sort_order: i + 1 }));
    setBanners(updated);
    try {
      await bannerApi.reorder(updated.map((b) => ({ id: b.id, sort_order: b.sort_order })));
    } catch {
      toast.error("순서 변경 중 오류가 발생했습니다.");
      load();
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(INIT_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <Image className="h-5 w-5 text-muted-foreground" />
              배너 관리
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              muunsaju.com 메인 화면의 슬라이드 배너를 관리합니다.
            </p>
          </div>
          {!tableError && (
            <Button onClick={openCreate} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              배너 추가
            </Button>
          )}
        </div>

        {/* DB 초기화 필요 안내 */}
        {tableError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">banners 테이블이 없습니다</p>
                <p className="text-sm text-amber-700 mt-1">
                  Supabase 대시보드 → SQL Editor에서 아래 SQL을 실행하면 배너 관리를 시작할 수 있습니다.
                </p>
              </div>
            </div>
            <div className="relative">
              <pre className="text-xs bg-white border border-amber-200 rounded-lg p-4 overflow-x-auto max-h-48 text-slate-700 leading-relaxed">
                {INIT_SQL}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 gap-1.5 text-xs"
                onClick={handleCopySQL}
              >
                <Copy className="h-3 w-3" />
                {sqlCopied ? "복사됨!" : "SQL 복사"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://supabase.com/dashboard/project/vuifbmsdggnwygvgcrkj/sql/new", "_blank")}
              >
                Supabase SQL Editor 열기 →
              </Button>
              <Button size="sm" variant="ghost" onClick={load}>
                테이블 생성 후 새로고침
              </Button>
            </div>
          </div>
        )}

        {/* 로딩 */}
        {loading && !tableError && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {/* 배너 목록 */}
        {!loading && !tableError && (
          <>
            {banners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Image className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">배너가 없습니다</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  배너 추가 버튼을 클릭하여 첫 번째 배너를 만들어보세요.
                </p>
                <Button onClick={openCreate} size="sm" className="mt-4 gap-1.5">
                  <Plus className="h-4 w-4" />
                  배너 추가
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  총 {banners.length}개 · 활성 {banners.filter((b) => b.is_active).length}개
                </p>
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`flex gap-3 p-3 rounded-xl border bg-card transition-opacity ${
                      !banner.is_active ? "opacity-50" : ""
                    }`}
                  >
                    {/* 순서 변경 버튼 */}
                    <div className="flex flex-col items-center justify-center gap-0.5 shrink-0">
                      <GripVertical className="h-4 w-4 text-muted-foreground/40 mb-1" />
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === banners.length - 1}
                        className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* 미리보기 */}
                    <div className="w-48 shrink-0">
                      <BannerPreview data={banner} />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate" style={{ whiteSpace: "pre-line" }}>
                          {banner.title}
                        </span>
                        {banner.tag && (
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {banner.tag}
                          </Badge>
                        )}
                        <Badge
                          variant={banner.is_active ? "default" : "outline"}
                          className="text-[10px] shrink-0"
                        >
                          {banner.is_active ? "활성" : "비활성"}
                        </Badge>
                      </div>
                      {banner.sub && (
                        <p className="text-xs text-muted-foreground truncate">{banner.sub}</p>
                      )}
                      <p className="text-xs text-muted-foreground/70">
                        링크: <span className="font-mono">{banner.href}</span>
                      </p>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                        title={banner.is_active ? "비활성화" : "활성화"}
                      >
                        {banner.is_active ? (
                          <Eye className="h-4 w-4 text-primary" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(banner)}
                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                        title="편집"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(banner.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 편집 다이얼로그 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "배너 편집" : "배너 추가"}</DialogTitle>
          </DialogHeader>

          {/* 실시간 미리보기 */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">미리보기</Label>
            <BannerPreview data={form} />
          </div>

          <div className="space-y-4">
            {/* 제목 */}
            <div className="space-y-1.5">
              <Label htmlFor="title">
                제목 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={"올해의 운세\n지금 확인하기"}
              />
              <p className="text-[11px] text-muted-foreground">줄바꿈은 \n으로 입력하세요.</p>
            </div>

            {/* 태그 */}
            <div className="space-y-1.5">
              <Label htmlFor="tag">태그 (선택)</Label>
              <Input
                id="tag"
                value={form.tag}
                onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                placeholder="2026 병오년"
              />
            </div>

            {/* 부제목 */}
            <div className="space-y-1.5">
              <Label htmlFor="sub">부제목 (선택)</Label>
              <Input
                id="sub"
                value={form.sub}
                onChange={(e) => setForm((f) => ({ ...f, sub: e.target.value }))}
                placeholder="월별 상세 · 12가지 운세 항목"
              />
            </div>

            {/* CTA */}
            <div className="space-y-1.5">
              <Label htmlFor="cta">
                CTA 버튼 텍스트 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cta"
                value={form.cta}
                onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
                placeholder="무료로 보기"
              />
            </div>

            {/* 링크 */}
            <div className="space-y-1.5">
              <Label htmlFor="href">
                링크 경로 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="href"
                value={form.href}
                onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
                placeholder="/yearly-fortune"
              />
            </div>

            {/* 그라디언트 */}
            <div className="space-y-1.5">
              <Label htmlFor="gradient">배경 그라디언트</Label>
              <Input
                id="gradient"
                value={form.gradient}
                onChange={(e) => setForm((f) => ({ ...f, gradient: e.target.value }))}
                placeholder="linear-gradient(135deg, #7B61FF 0%, #6A4FE8 100%)"
              />
              <p className="text-[11px] text-muted-foreground">
                CSS gradient 값을 입력하세요. 위 미리보기에 즉시 반영됩니다.
              </p>
            </div>

            {/* 워터마크 */}
            <div className="space-y-1.5">
              <Label htmlFor="watermark">워터마크 한자 (선택)</Label>
              <Input
                id="watermark"
                value={form.watermark}
                onChange={(e) => setForm((f) => ({ ...f, watermark: e.target.value }))}
                placeholder={"丙\n午"}
              />
              <p className="text-[11px] text-muted-foreground">
                배너 우측 하단에 반투명하게 표시되는 한자입니다.
              </p>
            </div>

            {/* 순서 */}
            <div className="space-y-1.5">
              <Label htmlFor="sort_order">표시 순서</Label>
              <Input
                id="sort_order"
                type="number"
                min={1}
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 1 }))
                }
              />
            </div>

            {/* 활성화 */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">배너 활성화</p>
                <p className="text-xs text-muted-foreground">
                  비활성화 시 muunsaju.com에 표시되지 않습니다.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "저장 중..." : editingId ? "수정 완료" : "배너 추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>배너를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 배너는 복구할 수 없습니다. muunsaju.com에서도 즉시 사라집니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

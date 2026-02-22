import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const metadataSchema = z.object({
  metaTitle: z
    .string()
    .min(1, "메타 제목은 필수입니다")
    .max(60, "메타 제목은 60자 이내여야 합니다"),
  metaDescription: z
    .string()
    .min(1, "메타 설명은 필수입니다")
    .max(160, "메타 설명은 160자 이내여야 합니다"),
  canonicalUrl: z
    .string()
    .url("유효한 URL을 입력하세요")
    .optional()
    .or(z.literal("")),
});

export type MetadataFormData = z.infer<typeof metadataSchema>;

interface MetadataFormProps {
  defaultValues?: Partial<MetadataFormData>;
  onSubmit: (data: MetadataFormData) => void;
}

/**
 * SEO 메타데이터 입력 폼
 * Meta Title, Meta Description, Canonical URL 관리
 */
export function MetadataForm({ defaultValues, onSubmit }: MetadataFormProps) {
  const form = useForm<MetadataFormData>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      metaTitle: defaultValues?.metaTitle || "",
      metaDescription: defaultValues?.metaDescription || "",
      canonicalUrl: defaultValues?.canonicalUrl || "",
    },
  });

  const metaTitleLength = form.watch("metaTitle").length;
  const metaDescriptionLength = form.watch("metaDescription").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO 메타데이터</CardTitle>
        <CardDescription>
          검색 엔진에 표시될 제목, 설명, 그리고 정규 URL을 설정하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Meta Title */}
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: [가입X/100%무료] 카리나 사주 분석"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    검색 결과에 표시될 제목입니다. ({metaTitleLength}/60)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meta Description */}
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="검색 결과에 표시될 요약 문구를 입력하세요."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    검색 결과에 표시될 설명입니다. ({metaDescriptionLength}/160)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Canonical URL */}
            <FormField
              control={form.control}
              name="canonicalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canonical URL (선택사항)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://muunsaju.com/guide/column-001"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    이 칼럼의 정규 URL입니다. 중복 콘텐츠 문제를 방지합니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 미리보기 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-semibold mb-3">검색 결과 미리보기</h3>
              <div className="space-y-1">
                <div className="text-blue-600 text-sm font-medium truncate">
                  {form.watch("metaTitle") || "Meta Title이 여기에 표시됩니다"}
                </div>
                <div className="text-gray-600 text-xs">
                  https://muunsaju.com/guide/...
                </div>
                <div className="text-gray-700 text-sm line-clamp-2">
                  {form.watch("metaDescription") ||
                    "Meta Description이 여기에 표시됩니다"}
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

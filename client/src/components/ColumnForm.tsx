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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "./RichTextEditor";
import { MetadataForm, MetadataFormData } from "./MetadataForm";
import { useState } from "react";

const columnSchema = z.object({
  slug: z
    .string()
    .min(1, "슬러그는 필수입니다")
    .regex(/^[a-z0-9-]+$/, "슬러그는 소문자, 숫자, 하이픈만 포함할 수 있습니다"),
  title: z.string().min(1, "제목은 필수입니다").max(255, "제목은 255자 이내여야 합니다"),
  category: z.string().min(1, "카테고리를 선택하세요"),
  author: z.string().default("무운 역술팀"),
  content: z.string().min(1, "내용은 필수입니다"),
  thumbnailUrl: z.string().optional().or(z.literal("")),
  readingTime: z.coerce.number().int().positive().optional(),
  published: z.boolean().default(false),
});

export type ColumnFormData = z.infer<typeof columnSchema>;

interface ColumnFormProps {
  categories: Array<{ id: number; name: string; slug: string }>;
  defaultValues?: Partial<ColumnFormData>;
  metadata?: Partial<MetadataFormData>;
  onSubmit: (data: ColumnFormData & MetadataFormData) => void;
  isLoading?: boolean;
}

/**
 * 칼럼 작성/편집 폼
 * 제목, 카테고리, 콘텐츠, SEO 메타데이터 등을 관리합니다.
 */
export function ColumnForm({
  categories,
  defaultValues,
  metadata,
  onSubmit,
  isLoading = false,
}: ColumnFormProps) {
  const [metadataData, setMetadataData] = useState<MetadataFormData | null>(null);

  const form = useForm<ColumnFormData>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      slug: defaultValues?.slug || "",
      title: defaultValues?.title || "",
      category: defaultValues?.category || "",
      author: defaultValues?.author || "무운 역술팀",
      content: defaultValues?.content || "",
      thumbnailUrl: defaultValues?.thumbnailUrl || "",
      readingTime: defaultValues?.readingTime || 5,
      published: defaultValues?.published || false,
    },
  });

  const handleFormSubmit = (columnData: ColumnFormData) => {
    if (!metadataData) {
      alert("SEO 메타데이터를 입력하세요.");
      return;
    }
    onSubmit({ ...columnData, ...metadataData });
  };

  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>칼럼의 기본 정보를 입력하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* 제목 */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 인생의 대운이 바뀌기 전, 반드시 나타나는 징조 3가지"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 슬러그 */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>슬러그 (URL)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: column-001"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL에 사용될 슬러그입니다. 소문자, 숫자, 하이픈만 사용 가능합니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 카테고리 */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카테고리</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 작성자 */}
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>작성자</FormLabel>
                    <FormControl>
                      <Input placeholder="무운 역술팀" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 읽기 시간 */}
              <FormField
                control={form.control}
                name="readingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>읽기 시간 (분)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} />
                    </FormControl>
                    <FormDescription>
                      예상 읽기 시간을 분 단위로 입력하세요.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 썸네일 URL */}
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>썸네일 이미지 URL (선택사항)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 콘텐츠 */}
      <Card>
        <CardHeader>
          <CardTitle>칼럼 내용</CardTitle>
          <CardDescription>
            WYSIWYG 에디터를 사용하여 칼럼 내용을 작성하세요. 마크다운 기호는 보이지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="칼럼 내용을 입력하세요..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* SEO 메타데이터 */}
      <MetadataForm
        defaultValues={metadata}
        onSubmit={(data) => {
          setMetadataData(data);
        }}
      />

      {/* 제출 버튼 */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline">취소</Button>
        <Button
          onClick={() => {
            form.handleSubmit(handleFormSubmit)();
          }}
          disabled={isLoading}
        >
          {isLoading ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vuifbmsdggnwygvgcrkj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWZibXNkZ2dud3lndmdjcmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzY0ODYsImV4cCI6MjA4NzQ1MjQ4Nn0.PhMK66O73HH98WIPAu66qk8FuXwJLU4Z2bhDcmDCpKI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// =====================================================
// 타입 정의
// =====================================================
export interface Column {
  id: string;
  name: string;
  title: string | null;
  description: string | null;
  content: string | null;
  category: string;
  author: string;
  thumbnail_url: string | null;
  read_time: number;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ColumnFormData {
  title: string;
  description: string;
  content: string;
  category: string;
  author: string;
  thumbnail_url: string;
  read_time: number;
  meta_title: string;
  meta_description: string;
  keywords: string;
  published: boolean;
}

export const CATEGORY_OPTIONS = [
  { value: "luck", label: "개운법" },
  { value: "basic", label: "사주 기초" },
  { value: "relationship", label: "관계 & 궁합" },
  { value: "health", label: "건강 & 운" },
  { value: "money", label: "재물운" },
  { value: "flow", label: "운명의 흐름" },
  { value: "career", label: "취업 & 커리어" },
  { value: "love", label: "연애 & 결혼" },
  { value: "family", label: "가족 & 자녀" },
];

// =====================================================
// Column API
// =====================================================
export const columnApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase getAll error:", error);
      throw error;
    }
    return (data || []) as Column[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Supabase getById error:", error);
      throw error;
    }
    return data as Column;
  },

  async create(formData: ColumnFormData) {
    const keywordsArray = formData.keywords
      ? formData.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    const insertData: Record<string, unknown> = {
      name: formData.title,
      title: formData.title,
      description: formData.description || null,
      content: formData.content || null,
      category: formData.category || "luck",
      author: formData.author || "무운 역술팀",
      thumbnail_url: formData.thumbnail_url || null,
      read_time: formData.read_time || 5,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
      keywords: keywordsArray.length > 0 ? keywordsArray : null,
      published: formData.published || false,
      published_at: formData.published ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("columns")
      .insert([insertData])
      .select()
      .single();
    if (error) {
      console.error("Supabase create error:", error);
      throw error;
    }
    return data as Column;
  },

  async update(id: string, formData: Partial<ColumnFormData>) {
    const updateData: Record<string, unknown> = {};

    if (formData.title !== undefined) {
      updateData.title = formData.title;
      updateData.name = formData.title;
    }
    if (formData.description !== undefined) updateData.description = formData.description || null;
    if (formData.content !== undefined) updateData.content = formData.content || null;
    if (formData.category !== undefined) updateData.category = formData.category;
    if (formData.author !== undefined) updateData.author = formData.author;
    if (formData.thumbnail_url !== undefined) updateData.thumbnail_url = formData.thumbnail_url || null;
    if (formData.read_time !== undefined) updateData.read_time = formData.read_time;
    if (formData.meta_title !== undefined) updateData.meta_title = formData.meta_title || null;
    if (formData.meta_description !== undefined) updateData.meta_description = formData.meta_description || null;
    if (formData.keywords !== undefined) {
      const keywordsArray = formData.keywords
        ? formData.keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [];
      updateData.keywords = keywordsArray.length > 0 ? keywordsArray : null;
    }
    if (formData.published !== undefined) {
      updateData.published = formData.published;
      if (formData.published) {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from("columns")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    return data as Column;
  },

  async delete(id: string) {
    const { error } = await supabase.from("columns").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }
  },
};

// =====================================================
// Storage API (썸네일 이미지 업로드)
// =====================================================

/**
 * Canvas API를 사용하여 이미지를 최적화(압축)합니다.
 * - 최대 해상도: 1920px (가로 기준)
 * - 출력 포맷: WebP (지원 시) / JPEG
 * - 품질: 0.85
 */
async function optimizeImage(file: File): Promise<File> {
  const MAX_WIDTH = 1920;
  const QUALITY = 0.85;
  const outputType = 'image/webp';

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // 원본 비율 유지하며 리사이즈
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 컨텍스트를 생성할 수 없습니다.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지 변환에 실패했습니다.'));
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, '');
          const optimized = new File([blob], `${baseName}.webp`, { type: outputType });
          resolve(optimized);
        },
        outputType,
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지를 불러올 수 없습니다.'));
    };

    img.src = objectUrl;
  });
}

export const storageApi = {
  async uploadThumbnail(file: File): Promise<string> {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new Error(`파일 크기가 10MB를 초과합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('JPG, PNG, GIF, WebP 형식의 이미지만 업로드 가능합니다.');
    }

    // GIF는 애니메이션 보존을 위해 최적화 건너뜀
    const optimized = file.type === 'image/gif' ? file : await optimizeImage(file);

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const { data, error } = await supabase.storage
      .from('column-thumbnails')
      .upload(fileName, optimized, { upsert: false, contentType: optimized.type });
    if (error) {
      console.error('Storage upload error:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
    const { data: urlData } = supabase.storage
      .from('column-thumbnails')
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  async deleteThumbnail(url: string): Promise<void> {
    try {
      const path = url.split('/column-thumbnails/').pop();
      if (!path) return;
      await supabase.storage.from('column-thumbnails').remove([path]);
    } catch (e) {
      console.warn('Storage delete warning:', e);
    }
  },
};

// =====================================================
// Dream API (꿈해몽)
// =====================================================
export interface Dream {
  id: string;
  keyword: string;
  slug: string;
  interpretation: string;
  traditional_meaning: string | null;
  psychological_meaning: string | null;
  category: string;
  grade: string;
  score: number;
  meta_title: string | null;
  meta_description: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DreamFormData {
  keyword: string;
  slug: string;
  interpretation: string;
  traditional_meaning: string;
  psychological_meaning: string;
  category: string;
  grade: string;
  score: number;
  meta_title: string;
  meta_description: string;
  published: boolean;
}

export const DREAM_CATEGORY_OPTIONS = [
  { value: "animal", label: "동물" },
  { value: "nature", label: "자연" },
  { value: "person", label: "사람" },
  { value: "object", label: "사물" },
  { value: "action", label: "행동" },
  { value: "emotion", label: "감정" },
  { value: "place", label: "장소" },
  { value: "other", label: "기타" },
];

export const DREAM_GRADE_OPTIONS = [
  { value: "great", label: "길몽" },
  { value: "good", label: "보통" },
  { value: "bad", label: "흉몽" },
];

function generateSlug(keyword: string): string {
  // 한글을 영문으로 변환하는 간단한 방식 - 타임스탬프 기반 slug
  const timestamp = Date.now();
  const sanitized = keyword
    .replace(/[^\w\s가-힣]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `${sanitized}-${timestamp}`;
}

export const dreamApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("dreams")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("dreamApi getAll error:", error);
      throw error;
    }
    return (data || []) as Dream[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("dreams")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("dreamApi getById error:", error);
      throw error;
    }
    return data as Dream;
  },

  async create(formData: DreamFormData) {
    const slug = formData.slug || generateSlug(formData.keyword);
    const insertData: Record<string, unknown> = {
      keyword: formData.keyword,
      slug,
      interpretation: formData.interpretation,
      traditional_meaning: formData.traditional_meaning || null,
      psychological_meaning: formData.psychological_meaning || null,
      category: formData.category || "other",
      grade: formData.grade || "good",
      score: formData.score ?? 70,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
      published: formData.published || false,
      published_at: formData.published ? new Date().toISOString() : null,
    };
    const { data, error } = await supabase
      .from("dreams")
      .insert([insertData])
      .select()
      .single();
    if (error) {
      console.error("dreamApi create error:", error);
      throw error;
    }
    return data as Dream;
  },

  async update(id: string, formData: Partial<DreamFormData>) {
    const updateData: Record<string, unknown> = {};
    if (formData.keyword !== undefined) updateData.keyword = formData.keyword;
    if (formData.slug !== undefined) updateData.slug = formData.slug;
    if (formData.interpretation !== undefined) updateData.interpretation = formData.interpretation;
    if (formData.traditional_meaning !== undefined) updateData.traditional_meaning = formData.traditional_meaning || null;
    if (formData.psychological_meaning !== undefined) updateData.psychological_meaning = formData.psychological_meaning || null;
    if (formData.category !== undefined) updateData.category = formData.category;
    if (formData.grade !== undefined) updateData.grade = formData.grade;
    if (formData.score !== undefined) updateData.score = formData.score;
    if (formData.meta_title !== undefined) updateData.meta_title = formData.meta_title || null;
    if (formData.meta_description !== undefined) updateData.meta_description = formData.meta_description || null;
    if (formData.published !== undefined) {
      updateData.published = formData.published;
      if (formData.published) updateData.published_at = new Date().toISOString();
    }
    updateData.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("dreams")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("dreamApi update error:", error);
      throw error;
    }
    return data as Dream;
  },

  async delete(id: string) {
    const { error } = await supabase.from("dreams").delete().eq("id", id);
    if (error) {
      console.error("dreamApi delete error:", error);
      throw error;
    }
  },
};

// =====================================================
// Featured Columns API (메인화면 추천 칼럼)
// =====================================================
export interface FeaturedColumn {
  id: string;
  column_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  column?: Column;
}

export const featuredApi = {
  async getAll(): Promise<FeaturedColumn[]> {
    const { data, error } = await supabase
      .from('featured_columns')
      .select('*, column:columns(*)')
      .order('position', { ascending: true });
    if (error) {
      console.error('featuredApi getAll error:', error);
      throw error;
    }
    return (data || []) as FeaturedColumn[];
  },

  async setFeatured(position: number, columnId: string): Promise<void> {
    const { error } = await supabase
      .from('featured_columns')
      .upsert({ position, column_id: columnId, updated_at: new Date().toISOString() }, { onConflict: 'position' });
    if (error) {
      console.error('featuredApi setFeatured error:', error);
      throw error;
    }
  },

  async removeFeatured(position: number): Promise<void> {
    const { error } = await supabase
      .from('featured_columns')
      .delete()
      .eq('position', position);
    if (error) {
      console.error('featuredApi removeFeatured error:', error);
      throw error;
    }
  },

  async clearAll(): Promise<void> {
    const { error } = await supabase.from('featured_columns').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
  },
};

// =====================================================
// Fortune Dictionary API (운세 사전)
// =====================================================
export interface FortuneDictionary {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  summary: string;
  original_meaning: string;
  modern_interpretation: string;
  muun_advice: string;
  category: string;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FortuneDictionaryFormData {
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  original_meaning: string;
  modern_interpretation: string;
  muun_advice: string;
  category: string;
  tags: string;
  meta_title: string;
  meta_description: string;
  published: boolean;
}

export const DICTIONARY_CATEGORY_OPTIONS = [
  { value: "basic", label: "사주 기초" },
  { value: "tenGod", label: "십신" },
  { value: "earthly", label: "지지" },
  { value: "heavenly", label: "천간" },
  { value: "luck", label: "운세 개념" },
  { value: "relationship", label: "관계 & 궁합" },
  { value: "health", label: "건강 & 신체" },
  { value: "money", label: "재물 & 직업" },
  { value: "other", label: "기타" },
];

function generateDictionarySlug(title: string): string {
  const timestamp = Date.now();
  const sanitized = title
    .replace(/[^\w\s가-힣]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `${sanitized}-${timestamp}`;
}

export const dictionaryApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("fortune_dictionary")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("dictionaryApi getAll error:", error);
      throw error;
    }
    return (data || []) as FortuneDictionary[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("fortune_dictionary")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("dictionaryApi getById error:", error);
      throw error;
    }
    return data as FortuneDictionary;
  },

  async create(formData: FortuneDictionaryFormData) {
    const slug = formData.slug || generateDictionarySlug(formData.title);
    const tagsArray = formData.tags
      ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const insertData: Record<string, unknown> = {
      title: formData.title,
      slug,
      subtitle: formData.subtitle || null,
      summary: formData.summary,
      original_meaning: formData.original_meaning,
      modern_interpretation: formData.modern_interpretation,
      muun_advice: formData.muun_advice,
      category: formData.category || "basic",
      tags: tagsArray.length > 0 ? tagsArray : [],
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
      published: formData.published || false,
      published_at: formData.published ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("fortune_dictionary")
      .insert([insertData])
      .select()
      .single();
    if (error) {
      console.error("dictionaryApi create error:", error);
      throw error;
    }
    return data as FortuneDictionary;
  },

  async update(id: string, formData: Partial<FortuneDictionaryFormData>) {
    const updateData: Record<string, unknown> = {};
    if (formData.title !== undefined) updateData.title = formData.title;
    if (formData.slug !== undefined) updateData.slug = formData.slug;
    if (formData.subtitle !== undefined) updateData.subtitle = formData.subtitle || null;
    if (formData.summary !== undefined) updateData.summary = formData.summary;
    if (formData.original_meaning !== undefined) updateData.original_meaning = formData.original_meaning;
    if (formData.modern_interpretation !== undefined) updateData.modern_interpretation = formData.modern_interpretation;
    if (formData.muun_advice !== undefined) updateData.muun_advice = formData.muun_advice;
    if (formData.category !== undefined) updateData.category = formData.category;
    if (formData.tags !== undefined) {
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      updateData.tags = tagsArray;
    }
    if (formData.meta_title !== undefined) updateData.meta_title = formData.meta_title || null;
    if (formData.meta_description !== undefined) updateData.meta_description = formData.meta_description || null;
    if (formData.published !== undefined) {
      updateData.published = formData.published;
      if (formData.published) updateData.published_at = new Date().toISOString();
    }
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("fortune_dictionary")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("dictionaryApi update error:", error);
      throw error;
    }
    return data as FortuneDictionary;
  },

  async delete(id: string) {
    const { error } = await supabase.from("fortune_dictionary").delete().eq("id", id);
    if (error) {
      console.error("dictionaryApi delete error:", error);
      throw error;
    }
  },
};

// =====================================================
// 임베딩 유사도 검사 API (꿈해몽 중복 방지)
// =====================================================

export interface SimilarDream {
  id: string;
  keyword: string;
  slug: string;
  similarity: number;
}

/**
 * 문자열 정규화: 공백 제거, 소문자 변환, 특수문자 제거
 */
function normalizeKeyword(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s\-_·•]/g, "") // 공백, 하이픈, 언더스코어, 중점 제거
    .replace(/[^가-힣a-z0-9]/g, ""); // 한글, 영문, 숫자만 남김
}

/**
 * Levenshtein 편집 거리 계산
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * 두 문자열의 유사도를 0~1 사이 값으로 반환 (1 = 완전 동일)
 * Levenshtein 거리 기반 + 정규화된 문자열 비교
 */
export function stringSimilarity(a: string, b: string): number {
  const na = normalizeKeyword(a);
  const nb = normalizeKeyword(b);
  if (na === nb) return 1.0;
  if (na.length === 0 || nb.length === 0) return 0.0;
  const maxLen = Math.max(na.length, nb.length);
  const dist = levenshteinDistance(na, nb);
  return 1 - dist / maxLen;
}

/**
 * 새 키워드와 기존 꿈해몽 목록의 유사도를 검사하여
 * 90% 이상 유사한 항목을 반환 (Levenshtein 문자열 유사도 기반)
 */
export async function checkDreamSimilarity(
  keyword: string,
  excludeId?: string
): Promise<SimilarDream[]> {
  // 1. 기존 꿈해몽 목록 전체 조회 (keyword, slug만)
  const { data, error } = await supabase
    .from("dreams")
    .select("id, keyword, slug");

  if (error) throw error;
  if (!data || data.length === 0) return [];

  // 2. 유사도 계산 및 90% 이상 필터링
  const results: SimilarDream[] = [];
  for (const dream of data) {
    if (excludeId && dream.id === excludeId) continue;
    const similarity = stringSimilarity(keyword, dream.keyword);
    if (similarity >= 0.9) {
      results.push({
        id: dream.id,
        keyword: dream.keyword,
        slug: dream.slug,
        similarity: Math.round(similarity * 100),
      });
    }
  }

  // 유사도 내림차순 정렬
  return results.sort((a, b) => b.similarity - a.similarity);
}

// =====================================================
// Banner API (메인 배너 관리)
// =====================================================

export interface Banner {
  id: string;
  title: string;
  sub: string | null;
  tag: string | null;
  cta: string;
  href: string;
  gradient: string;
  watermark: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BannerFormData {
  title: string;
  sub: string;
  tag: string;
  cta: string;
  href: string;
  gradient: string;
  watermark: string;
  sort_order: number;
  is_active: boolean;
}

export const bannerApi = {
  async getAll(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("bannerApi.getAll error:", error);
      throw error;
    }
    return (data || []) as Banner[];
  },

  async getActive(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("bannerApi.getActive error:", error);
      throw error;
    }
    return (data || []) as Banner[];
  },

  async getById(id: string): Promise<Banner> {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("bannerApi.getById error:", error);
      throw error;
    }
    return data as Banner;
  },

  async create(formData: BannerFormData): Promise<Banner> {
    const { data, error } = await supabase
      .from("banners")
      .insert([{
        title: formData.title,
        sub: formData.sub || null,
        tag: formData.tag || null,
        cta: formData.cta,
        href: formData.href,
        gradient: formData.gradient,
        watermark: formData.watermark || null,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      }])
      .select()
      .single();
    if (error) {
      console.error("bannerApi.create error:", error);
      throw error;
    }
    return data as Banner;
  },

  async update(id: string, formData: Partial<BannerFormData>): Promise<Banner> {
    const updateData: Record<string, unknown> = {};
    if (formData.title !== undefined) updateData.title = formData.title;
    if (formData.sub !== undefined) updateData.sub = formData.sub || null;
    if (formData.tag !== undefined) updateData.tag = formData.tag || null;
    if (formData.cta !== undefined) updateData.cta = formData.cta;
    if (formData.href !== undefined) updateData.href = formData.href;
    if (formData.gradient !== undefined) updateData.gradient = formData.gradient;
    if (formData.watermark !== undefined) updateData.watermark = formData.watermark || null;
    if (formData.sort_order !== undefined) updateData.sort_order = formData.sort_order;
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active;

    const { data, error } = await supabase
      .from("banners")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("bannerApi.update error:", error);
      throw error;
    }
    return data as Banner;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) {
      console.error("bannerApi.delete error:", error);
      throw error;
    }
  },

  async reorder(items: { id: string; sort_order: number }[]): Promise<void> {
    const updates = items.map(({ id, sort_order }) =>
      supabase.from("banners").update({ sort_order }).eq("id", id)
    );
    await Promise.all(updates);
  },
};

// =====================================================
// Design Theme API (디자인 시스템 관리)
// =====================================================

// 컴포넌트 토큰 타입 - 컴포넌트별 CSS 변수 맵
export type ComponentTokenGroup = Record<string, string>;
export interface ComponentTokens {
  global?: ComponentTokenGroup;    // 전역 shape/radius
  button?: ComponentTokenGroup;    // 버튼
  card?: ComponentTokenGroup;      // 카드
  input?: ComponentTokenGroup;     // 인풋/텍스트에어리어
  badge?: ComponentTokenGroup;     // 배지
  "bottom-nav"?: ComponentTokenGroup; // 바텀 네비게이션
  gnb?: ComponentTokenGroup;       // GNB 상단 네비게이션
  dialog?: ComponentTokenGroup;    // 다이얼로그/모달
  tabs?: ComponentTokenGroup;      // 탭
  accordion?: ComponentTokenGroup; // 아코디언
  toast?: ComponentTokenGroup;     // 토스트/알림
  select?: ComponentTokenGroup;    // 셀렉트/드롭다운
  avatar?: ComponentTokenGroup;    // 아바타
  divider?: ComponentTokenGroup;   // 구분선
  scrollbar?: ComponentTokenGroup; // 스크롤바
  [key: string]: ComponentTokenGroup | undefined;
}

export interface DesignTheme {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  colors: Record<string, string>;
  typography: Record<string, string>;
  gradients: Record<string, string>;
  component_tokens: ComponentTokens;
  created_at: string;
  updated_at: string;
}

export interface DesignThemeFormData {
  name: string;
  description: string;
  is_active: boolean;
  colors: Record<string, string>;
  typography: Record<string, string>;
  gradients: Record<string, string>;
  component_tokens: ComponentTokens;
}

// 무운 사이트의 실제 CSS 변수 목록 (편집 가능한 토큰)
export const DESIGN_TOKEN_DEFINITIONS = {
  colors: [
    // 기본
    {
      key: "--background",
      label: "페이지 배경색",
      group: "기본",
      description: "사이트 전체 배경. 메인 페이지, 칼럼 목록, 상세 페이지 등 모든 화면의 바탕색입니다.",
      usedIn: ["메인 페이지", "칼럼 목록", "상세 페이지", "전체 화면"]
    },
    {
      key: "--foreground",
      label: "기본 텍스트",
      group: "기본",
      description: "가장 기본이 되는 텍스트 색상. 제목, 본문, 메뉴 등 대부분의 텍스트에 적용됩니다.",
      usedIn: ["제목", "본문 텍스트", "메뉴", "전체 화면"]
    },
    {
      key: "--foreground-secondary",
      label: "보조 텍스트",
      group: "기본",
      description: "날짜, 카테고리, 부제목 등 주요 텍스트보다 덜 강조되는 보조 정보에 사용됩니다.",
      usedIn: ["날짜", "카테고리", "부제목", "칼럼 카드"]
    },
    {
      key: "--foreground-tertiary",
      label: "3차 텍스트 (힌트)",
      group: "기본",
      description: "플레이스홀더, 비활성 상태, 힌트 텍스트 등 가장 약하게 표시되는 텍스트입니다.",
      usedIn: ["플레이스홀더", "비활성 메뉴", "힌트 텍스트"]
    },
    {
      key: "--card",
      label: "카드 배경",
      group: "기본",
      description: "칼럼 카드, 꿈해몽 카드, 사전 항목 카드 등 콘텐츠 카드의 배경색입니다.",
      usedIn: ["칼럼 카드", "꿈해몽 카드", "사전 카드", "팝업"]
    },
    {
      key: "--card-foreground",
      label: "카드 텍스트",
      group: "기본",
      description: "카드 내부의 제목, 설명 등 텍스트 색상입니다.",
      usedIn: ["칼럼 카드 제목", "카드 설명"]
    },
    // 브랜드
    {
      key: "--primary",
      label: "브랜드 주색 (퍼플)",
      group: "브랜드",
      description: "무운의 핵심 브랜드 색상. 주요 버튼, 활성 탭, 링크, 아이콘 강조에 사용됩니다.",
      usedIn: ["주요 버튼", "활성 탭", "링크", "GNB 아이콘", "배지"]
    },
    {
      key: "--primary-foreground",
      label: "브랜드 주색 위 텍스트",
      group: "브랜드",
      description: "프라이머리 색상 배경 위에 올라가는 텍스트 색상 (주로 흰색).",
      usedIn: ["주요 버튼 텍스트", "활성 배지 텍스트"]
    },
    {
      key: "--primary-light",
      label: "브랜드 주색 밝은 버전",
      group: "브랜드",
      description: "호버 상태, 강조 아이콘 등 프라이머리보다 밝은 변형이 필요할 때 사용됩니다.",
      usedIn: ["버튼 호버", "아이콘 강조"]
    },
    {
      key: "--secondary",
      label: "보조 배경",
      group: "브랜드",
      description: "비활성 버튼, 탭 배경, 칩 배경 등 주색보다 덜 강조되는 UI 요소의 배경색입니다.",
      usedIn: ["비활성 버튼", "탭 배경", "칩/태그"]
    },
    {
      key: "--secondary-foreground",
      label: "보조 배경 위 텍스트",
      group: "브랜드",
      description: "세컨더리 배경 위에 올라가는 텍스트 색상입니다.",
      usedIn: ["비활성 버튼 텍스트", "탭 텍스트"]
    },
    // UI
    {
      key: "--muted",
      label: "뮤트 배경 (연한 회색)",
      group: "UI",
      description: "스켈레톤 로딩, 비활성 영역, 코드 블록 배경 등 눈에 덜 띄는 배경에 사용됩니다.",
      usedIn: ["스켈레톤 로딩", "코드 블록", "비활성 영역"]
    },
    {
      key: "--muted-foreground",
      label: "뮤트 텍스트",
      group: "UI",
      description: "뮤트 배경 위의 텍스트, 또는 덜 강조되는 설명 텍스트에 사용됩니다.",
      usedIn: ["설명 텍스트", "메타 정보", "읽기 시간"]
    },
    {
      key: "--accent",
      label: "액센트 배경 (반투명 퍼플)",
      group: "UI",
      description: "선택된 항목, 호버 상태, 강조 영역의 배경색. 주로 반투명 퍼플로 설정됩니다.",
      usedIn: ["선택된 메뉴", "호버 상태", "강조 카드 배경"]
    },
    {
      key: "--accent-foreground",
      label: "액센트 배경 위 텍스트",
      group: "UI",
      description: "액센트 배경 위에 올라가는 텍스트 색상입니다.",
      usedIn: ["선택된 메뉴 텍스트", "강조 텍스트"]
    },
    {
      key: "--border",
      label: "테두리 색상",
      group: "UI",
      description: "카드, 인풋, 구분선 등 모든 테두리에 사용되는 색상입니다.",
      usedIn: ["카드 테두리", "인풋 테두리", "구분선", "전체 화면"]
    },
    {
      key: "--input",
      label: "입력 필드 배경",
      group: "UI",
      description: "검색창, 텍스트 입력 필드의 배경색입니다.",
      usedIn: ["검색창", "입력 필드"]
    },
    {
      key: "--ring",
      label: "포커스 링 색상",
      group: "UI",
      description: "키보드 포커스 시 나타나는 외곽선 색상. 접근성을 위해 사용됩니다.",
      usedIn: ["버튼 포커스", "인풋 포커스", "링크 포커스"]
    },
    // 상태
    {
      key: "--destructive",
      label: "위험/오류 색상 (빨강)",
      group: "상태",
      description: "삭제 버튼, 오류 메시지, 경고 상태 표시에 사용됩니다.",
      usedIn: ["삭제 버튼", "오류 메시지", "경고 상태"]
    },
  ],
  typography: [
    {
      key: "--font-display",
      label: "제목용 폰트 (세리프)",
      group: "폰트 패밀리",
      description: "칼럼 제목, 메인 헤드라인 등 강조가 필요한 제목에 사용되는 폰트입니다.",
      usedIn: ["칼럼 제목", "메인 헤드라인", "사전 항목 제목"]
    },
    {
      key: "--font-body",
      label: "본문용 폰트 (산세리프)",
      group: "폰트 패밀리",
      description: "본문 텍스트, UI 레이블, 버튼 텍스트 등 일반적인 텍스트에 사용되는 폰트입니다.",
      usedIn: ["본문 텍스트", "버튼", "메뉴", "전체 UI"]
    },
    {
      key: "--font-size-display-large",
      label: "디스플레이 Large (57px)",
      group: "크기 스케일",
      description: "메인 페이지 히어로 영역의 가장 큰 제목에 사용됩니다.",
      usedIn: ["메인 히어로 제목"]
    },
    {
      key: "--font-size-display-medium",
      label: "디스플레이 Medium (45px)",
      group: "크기 스케일",
      description: "섹션 대표 타이틀, 랜딩 페이지 부제목에 사용됩니다.",
      usedIn: ["섹션 대표 타이틀"]
    },
    {
      key: "--font-size-display-small",
      label: "디스플레이 Small (36px)",
      group: "크기 스케일",
      description: "페이지 상단 대형 제목에 사용됩니다.",
      usedIn: ["페이지 대형 제목"]
    },
    {
      key: "--font-size-headline-large",
      label: "헤드라인 Large (32px)",
      group: "크기 스케일",
      description: "칼럼 상세 페이지의 메인 제목에 사용됩니다.",
      usedIn: ["칼럼 상세 제목"]
    },
    {
      key: "--font-size-headline-medium",
      label: "헤드라인 Medium (28px)",
      group: "크기 스케일",
      description: "섹션 제목, 꿈해몽 상세 제목에 사용됩니다.",
      usedIn: ["섹션 제목", "꿈해몽 상세 제목"]
    },
    {
      key: "--font-size-headline-small",
      label: "헤드라인 Small (24px)",
      group: "크기 스케일",
      description: "카드 그룹 제목, 사전 항목 제목에 사용됩니다.",
      usedIn: ["카드 그룹 제목", "사전 항목 제목"]
    },
    {
      key: "--font-size-title-large",
      label: "타이틀 Large (22px)",
      group: "크기 스케일",
      description: "칼럼 카드 제목, 모달 제목에 사용됩니다.",
      usedIn: ["칼럼 카드 제목", "모달 제목"]
    },
    {
      key: "--font-size-title-medium",
      label: "타이틀 Medium (16px)",
      group: "크기 스케일",
      description: "소형 카드 제목, 리스트 항목 제목에 사용됩니다.",
      usedIn: ["소형 카드 제목", "리스트 항목"]
    },
    {
      key: "--font-size-body-large",
      label: "본문 Large (16px)",
      group: "크기 스케일",
      description: "칼럼 본문 텍스트, 상세 페이지 설명에 사용됩니다.",
      usedIn: ["칼럼 본문", "상세 페이지 설명"]
    },
    {
      key: "--font-size-body-medium",
      label: "본문 Medium (14px)",
      group: "크기 스케일",
      description: "일반 UI 텍스트, 카드 설명, 메뉴 항목에 사용됩니다.",
      usedIn: ["카드 설명", "메뉴 항목", "일반 UI"]
    },
    {
      key: "--font-size-body-small",
      label: "본문 Small (12px)",
      group: "크기 스케일",
      description: "날짜, 읽기 시간, 부가 정보 등 작은 텍스트에 사용됩니다.",
      usedIn: ["날짜", "읽기 시간", "부가 정보"]
    },
    {
      key: "--font-size-label-large",
      label: "레이블 Large (14px)",
      group: "크기 스케일",
      description: "버튼 텍스트, 탭 레이블, 배지 텍스트에 사용됩니다.",
      usedIn: ["버튼 텍스트", "탭 레이블", "배지"]
    },
    {
      key: "--font-size-label-medium",
      label: "레이블 Medium (12px)",
      group: "크기 스케일",
      description: "작은 버튼, 칩, 태그 텍스트에 사용됩니다.",
      usedIn: ["작은 버튼", "칩", "태그"]
    },
    {
      key: "--font-size-label-small",
      label: "레이블 Small (11px)",
      group: "크기 스케일",
      description: "바텀 네비게이션 레이블, 아이콘 아래 텍스트에 사용됩니다.",
      usedIn: ["바텀 네비 레이블", "아이콘 텍스트"]
    },
  ],
  gradients: [
    {
      key: "--aurora",
      label: "메인 히어로 배경 (Aurora)",
      group: "히어로",
      description: "메인 히어로 섹션 전체 배경색입니다. 이 값을 바꾸면 홈 화면 상단 배경이 바뀝니다.",
      usedIn: ["메인 히어로 섹션 배경", "재방문 히어로 섹션 배경"]
    },
    {
      key: "--gradient-aurora-1",
      label: "오로라 그라디언트 1 (퍼플-바이올렛)",
      group: "오로라",
      description: "메인 페이지 배경 오로라 효과, 히어로 섹션 장식에 사용됩니다.",
      usedIn: ["메인 히어로 배경", "오로라 장식"]
    },
    {
      key: "--gradient-aurora-2",
      label: "오로라 그라디언트 2 (핑크-레드)",
      group: "오로라",
      description: "메인 페이지 오로라 효과의 두 번째 레이어에 사용됩니다.",
      usedIn: ["메인 히어로 배경", "오로라 장식"]
    },
    {
      key: "--gradient-aurora-3",
      label: "오로라 그라디언트 3 (블루-시안)",
      group: "오로라",
      description: "메인 페이지 오로라 효과의 세 번째 레이어에 사용됩니다.",
      usedIn: ["메인 히어로 배경", "오로라 장식"]
    },
    {
      key: "--gradient-primary",
      label: "브랜드 그라디언트 (퍼플)",
      group: "브랜드",
      description: "CTA 버튼, 배너, 강조 카드 등 브랜드를 강하게 표현할 때 사용됩니다.",
      usedIn: ["CTA 버튼", "배너", "강조 카드"]
    },
  ],
};

export const designThemeApi = {
  async getAll(): Promise<DesignTheme[]> {
    const { data, error } = await supabase
      .from("design_themes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("designThemeApi.getAll error:", error);
      throw error;
    }
    return (data || []) as DesignTheme[];
  },

  async getById(id: string): Promise<DesignTheme> {
    const { data, error } = await supabase
      .from("design_themes")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("designThemeApi.getById error:", error);
      throw error;
    }
    return data as DesignTheme;
  },

  async getActive(): Promise<DesignTheme | null> {
    const { data, error } = await supabase
      .from("design_themes")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();
    if (error) {
      console.error("designThemeApi.getActive error:", error);
      throw error;
    }
    return data as DesignTheme | null;
  },

  async create(formData: DesignThemeFormData): Promise<DesignTheme> {
    const { data, error } = await supabase
      .from("design_themes")
      .insert([{
        name: formData.name,
        description: formData.description || null,
        is_active: formData.is_active,
        colors: formData.colors,
        typography: formData.typography,
        gradients: formData.gradients,
        component_tokens: formData.component_tokens || {},
      }])
      .select()
      .single();
    if (error) {
      console.error("designThemeApi.create error:", error);
      throw error;
    }
    return data as DesignTheme;
  },

  async update(id: string, formData: Partial<DesignThemeFormData>): Promise<DesignTheme> {
    const updateData: Record<string, unknown> = {};
    if (formData.name !== undefined) updateData.name = formData.name;
    if (formData.description !== undefined) updateData.description = formData.description || null;
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active;
    if (formData.colors !== undefined) updateData.colors = formData.colors;
    if (formData.typography !== undefined) updateData.typography = formData.typography;
    if (formData.gradients !== undefined) updateData.gradients = formData.gradients;
    if (formData.component_tokens !== undefined) updateData.component_tokens = formData.component_tokens;

    const { data, error } = await supabase
      .from("design_themes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("designThemeApi.update error:", error);
      throw error;
    }
    return data as DesignTheme;
  },

  async activate(id: string): Promise<void> {
    // 모든 테마 비활성화 후 선택한 테마 활성화
    await supabase.from("design_themes").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    const { error } = await supabase
      .from("design_themes")
      .update({ is_active: true })
      .eq("id", id);
    if (error) {
      console.error("designThemeApi.activate error:", error);
      throw error;
    }
  },

  async duplicate(id: string): Promise<DesignTheme> {
    const original = await this.getById(id);
    const { data, error } = await supabase
      .from("design_themes")
      .insert([{
        name: `${original.name} (복사본)`,
        description: original.description,
        is_active: false,
        colors: original.colors,
        typography: original.typography,
        gradients: original.gradients,
        component_tokens: original.component_tokens || {},
      }])
      .select()
      .single();
    if (error) {
      console.error("designThemeApi.duplicate error:", error);
      throw error;
    }
    return data as DesignTheme;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("design_themes").delete().eq("id", id);
    if (error) {
      console.error("designThemeApi.delete error:", error);
      throw error;
    }
  },
};

// =====================================================
// 컴포넌트 토큰 정의 - 어드민 편집기에서 사용
// =====================================================
export interface ComponentTokenDef {
  key: string;
  label: string;
  type: "size" | "color" | "shadow" | "font-size" | "font-weight" | "number" | "text";
  unit?: string;      // px, rem, % 등
  min?: number;
  max?: number;
  description?: string;
}

export interface ComponentSection {
  id: string;
  label: string;
  description: string;
  icon: string;       // lucide 아이콘 이름
  usedIn?: string[];  // 적용 화면/컴포넌트 태그
  tokens: ComponentTokenDef[];
}

export const COMPONENT_TOKEN_DEFINITIONS: ComponentSection[] = [
  {
    id: "global",
    label: "전역 Shape",
    description: "사이트 전체에 적용되는 모서리 둥근기(radius) 기준값",
    icon: "Shapes",
    usedIn: ["전체 화면", "모든 컴포넌트"],
    tokens: [
      { key: "--radius", label: "기본 Radius", type: "size", unit: "rem", description: "카드, 버튼 등 기본 모서리 반경" },
      { key: "--radius-sm", label: "Small Radius", type: "size", unit: "rem" },
      { key: "--radius-md", label: "Medium Radius", type: "size", unit: "rem" },
      { key: "--radius-lg", label: "Large Radius", type: "size", unit: "rem" },
      { key: "--radius-xl", label: "XLarge Radius", type: "size", unit: "rem" },
      { key: "--radius-full", label: "Full Radius (pill)", type: "size", unit: "px" },
    ],
  },
  {
    id: "button",
    label: "버튼",
    description: "버튼 컴포넌트의 크기, 패딩, 모서리, 폰트 설정",
    icon: "MousePointerClick",
    usedIn: ["사주 분석 시작 버튼", "칼럼 상세 액션", "폼 제출", "모달 확인 버튼"],
    tokens: [
      { key: "--btn-height-xs", label: "높이 XS", type: "size", unit: "px", min: 20, max: 60 },
      { key: "--btn-height-sm", label: "높이 SM", type: "size", unit: "px", min: 20, max: 60 },
      { key: "--btn-height-md", label: "높이 MD", type: "size", unit: "px", min: 24, max: 80 },
      { key: "--btn-height-lg", label: "높이 LG", type: "size", unit: "px", min: 32, max: 80 },
      { key: "--btn-height-xl", label: "높이 XL", type: "size", unit: "px", min: 40, max: 100 },
      { key: "--btn-padding-x-sm", label: "가로 패딩 SM", type: "size", unit: "px", min: 4, max: 40 },
      { key: "--btn-padding-x-md", label: "가로 패딩 MD", type: "size", unit: "px", min: 4, max: 40 },
      { key: "--btn-padding-x-lg", label: "가로 패딩 LG", type: "size", unit: "px", min: 4, max: 48 },
      { key: "--btn-radius-sm", label: "Radius SM", type: "size", unit: "px", min: 0, max: 24 },
      { key: "--btn-radius-md", label: "Radius MD", type: "size", unit: "px", min: 0, max: 24 },
      { key: "--btn-radius-lg", label: "Radius LG", type: "size", unit: "px", min: 0, max: 24 },
      { key: "--btn-font-size-sm", label: "폰트 크기 SM", type: "font-size", unit: "px", min: 10, max: 20 },
      { key: "--btn-font-size-md", label: "폰트 크기 MD", type: "font-size", unit: "px", min: 10, max: 24 },
      { key: "--btn-font-size-lg", label: "폰트 크기 LG", type: "font-size", unit: "px", min: 12, max: 28 },
      { key: "--btn-font-weight", label: "폰트 굵기", type: "font-weight", description: "100~900 사이 값" },
      { key: "--btn-gap-md", label: "아이콘 간격", type: "size", unit: "px", min: 0, max: 16 },
    ],
  },
  {
    id: "card",
    label: "카드",
    description: "카드 컴포넌트의 모서리, 패딩, 테두리, 그림자 설정",
    icon: "LayoutDashboard",
    usedIn: ["칼럼 목록 카드", "꿈해몽 카드", "사전 항목 카드", "메인 콘텐츠 카드"],
    tokens: [
      { key: "--card-radius", label: "Radius", type: "size", unit: "px", min: 0, max: 32 },
      { key: "--card-padding", label: "기본 패딩", type: "size", unit: "px", min: 8, max: 48 },
      { key: "--card-padding-sm", label: "Small 패딩", type: "size", unit: "px", min: 8, max: 40 },
      { key: "--card-padding-lg", label: "Large 패딩", type: "size", unit: "px", min: 12, max: 56 },
      { key: "--card-border-width", label: "테두리 두께", type: "size", unit: "px", min: 0, max: 4 },
      { key: "--card-shadow", label: "기본 그림자", type: "shadow", description: "CSS box-shadow 값" },
      { key: "--card-shadow-hover", label: "호버 그림자", type: "shadow", description: "호버 시 box-shadow 값" },
      { key: "--card-gap", label: "내부 간격", type: "size", unit: "px", min: 0, max: 32 },
    ],
  },
  {
    id: "input",
    label: "인풋 / 텍스트에어리아",
    description: "입력 필드의 높이, 패딩, 모서리, 테두리 설정",
    icon: "TextCursorInput",
    usedIn: ["검색창", "로그인 폼", "사주 입력 폼", "문의 폼"],
    tokens: [
      { key: "--input-height-sm", label: "높이 SM", type: "size", unit: "px", min: 24, max: 56 },
      { key: "--input-height-md", label: "높이 MD", type: "size", unit: "px", min: 28, max: 64 },
      { key: "--input-height-lg", label: "높이 LG", type: "size", unit: "px", min: 36, max: 72 },
      { key: "--input-padding-x", label: "가로 패딩", type: "size", unit: "px", min: 4, max: 32 },
      { key: "--input-radius", label: "Radius", type: "size", unit: "px", min: 0, max: 20 },
      { key: "--input-border-width", label: "테두리 두께", type: "size", unit: "px", min: 0, max: 4 },
      { key: "--input-font-size", label: "폰트 크기", type: "font-size", unit: "px", min: 10, max: 20 },
      { key: "--input-ring-width", label: "포커스 링 두께", type: "size", unit: "px", min: 0, max: 8 },
      { key: "--input-ring-color", label: "포커스 링 색상", type: "color", description: "rgba() 또는 hex 값" },
    ],
  },
  {
    id: "badge",
    label: "배지",
    description: "배지/태그 컴포넌트의 크기, 모서리, 폰트 설정",
    icon: "Tag",
    usedIn: ["카테고리 태그", "상태 배지", "칼럼 카드 태그", "신규 배지"],
    tokens: [
      { key: "--badge-radius", label: "Radius", type: "size", unit: "px", min: 0, max: 9999, description: "9999px = 완전한 pill 형태" },
      { key: "--badge-padding-x", label: "가로 패딩", type: "size", unit: "px", min: 2, max: 20 },
      { key: "--badge-padding-y", label: "세로 패딩", type: "size", unit: "px", min: 0, max: 12 },
      { key: "--badge-font-size", label: "폰트 크기", type: "font-size", unit: "px", min: 8, max: 16 },
      { key: "--badge-font-weight", label: "폰트 굵기", type: "font-weight" },
      { key: "--badge-border-width", label: "테두리 두께", type: "size", unit: "px", min: 0, max: 4 },
    ],
  },
  {
    id: "bottom-nav",
    label: "바텀 네비게이션",
    description: "모바일 하단 네비게이션 바의 크기, 아이콘, 레이블 설정",
    icon: "Navigation",
    usedIn: ["모바일 전체 화면 하단", "홈/칼럼/매거진/마이페이지 이동"],
    tokens: [
      { key: "--bottom-nav-height", label: "높이", type: "size", unit: "px", min: 40, max: 80 },
      { key: "--bottom-nav-shadow", label: "그림자", type: "shadow" },
      { key: "--bottom-nav-icon-size", label: "아이콘 크기", type: "size", unit: "px", min: 16, max: 32 },
      { key: "--bottom-nav-label-size", label: "레이블 폰트 크기", type: "font-size", unit: "px", min: 8, max: 14 },
      { key: "--bottom-nav-dot-size", label: "활성 점 크기", type: "size", unit: "px", min: 2, max: 8 },
    ],
  },
  {
    id: "gnb",
    label: "GNB",
    description: "상단 헤더 바의 높이, 타이틀 크기, 패딩 설정",
    icon: "PanelTop",
    usedIn: ["상세 페이지 상단 헤더", "칼럼 상세", "사전 상세", "꿈해몽 상세"],
    tokens: [
      { key: "--gnb-height", label: "높이", type: "size", unit: "px", min: 40, max: 80 },
      { key: "--gnb-shadow", label: "그림자", type: "shadow", description: "none 또는 CSS box-shadow 값" },
      { key: "--gnb-title-size", label: "타이틀 폰트 크기", type: "font-size", unit: "px", min: 12, max: 24 },
      { key: "--gnb-title-weight", label: "타이틀 폰트 굵기", type: "font-weight" },
      { key: "--gnb-icon-size", label: "아이콘 크기", type: "size", unit: "px", min: 16, max: 36 },
      { key: "--gnb-padding-x", label: "가로 패딩", type: "size", unit: "px", min: 8, max: 32 },
    ],
  },
  {
    id: "dialog",
    label: "다이얼로그 / 모달",
    description: "모달 사의 모서리, 패딩, 그림자, 오버레이 설정",
    icon: "RectangleHorizontal",
    usedIn: ["사주 분석 결과 팝업", "로그인 모달", "필터 팝업", "콘텐츠 미리보기"],

    tokens: [
      { key: "--dialog-radius", label: "Radius", type: "size", unit: "px", min: 0, max: 32 },
      { key: "--dialog-padding", label: "패딩", type: "size", unit: "px", min: 12, max: 48 },
      { key: "--dialog-shadow", label: "그림자", type: "shadow" },
      { key: "--dialog-overlay-bg", label: "오버레이 배경", type: "color", description: "rgba() 값" },
      { key: "--dialog-title-size", label: "타이틀 폰트 크기", type: "font-size", unit: "px", min: 14, max: 28 },
      { key: "--dialog-title-weight", label: "타이틀 폰트 굵기", type: "font-weight" },
    ],
  },
  {
    id: "tabs",
    label: "탭",
    description: "탭 컴포넌트의 배경, 모서리, 크기, 폰트 설정",
    icon: "Layers",
    usedIn: ["칼럼 카테고리 탭", "사주 유형 선택 탭", "마이페이지 설정 탭"],

    tokens: [
      { key: "--tabs-list-radius", label: "탭 목록 Radius", type: "size", unit: "px", min: 0, max: 20 },
      { key: "--tabs-list-padding", label: "탭 목록 패딩", type: "size", unit: "px", min: 0, max: 12 },
      { key: "--tabs-trigger-radius", label: "탭 버튼 Radius", type: "size", unit: "px", min: 0, max: 16 },
      { key: "--tabs-trigger-height", label: "탭 버튼 높이", type: "size", unit: "px", min: 24, max: 56 },
      { key: "--tabs-trigger-padding-x", label: "탭 버튼 가로 패딩", type: "size", unit: "px", min: 4, max: 32 },
      { key: "--tabs-trigger-font-size", label: "탭 폰트 크기", type: "font-size", unit: "px", min: 10, max: 18 },
      { key: "--tabs-trigger-font-weight", label: "탭 폰트 굵기", type: "font-weight" },
      { key: "--tabs-active-shadow", label: "활성 탭 그림자", type: "shadow" },
    ],
  },
  {
    id: "toast",
    label: "토스트 / 알림",
    description: "토스트 알림의 모서리, 패딩, 그림자, 폰트 설정",
    icon: "Bell",
    usedIn: ["저장 성공 알림", "오류 알림", "복사 완료 알림", "로그인 알림"],

    tokens: [
      { key: "--toast-radius", label: "Radius", type: "size", unit: "px", min: 0, max: 24 },
      { key: "--toast-padding-x", label: "가로 패딩", type: "size", unit: "px", min: 8, max: 32 },
      { key: "--toast-padding-y", label: "세로 패딩", type: "size", unit: "px", min: 4, max: 24 },
      { key: "--toast-shadow", label: "그림자", type: "shadow" },
      { key: "--toast-font-size", label: "폰트 크기", type: "font-size", unit: "px", min: 10, max: 18 },
      { key: "--toast-font-weight", label: "폰트 굵기", type: "font-weight" },
    ],
  },
  {
    id: "select",
    label: "셀렉트 / 드롭다운",
    description: "셀렉트 박스의 높이, 모서리, 드롭다운 패널 설정",
    icon: "ChevronDown",
    usedIn: ["사주 유형 선택", "연도/월/일 선택", "지역 필터", "정렬 옵션"],

    tokens: [
      { key: "--select-trigger-height", label: "트리거 높이", type: "size", unit: "px", min: 28, max: 64 },
      { key: "--select-trigger-radius", label: "트리거 Radius", type: "size", unit: "px", min: 0, max: 20 },
      { key: "--select-trigger-padding-x", label: "트리거 가로 패딩", type: "size", unit: "px", min: 4, max: 24 },
      { key: "--select-content-radius", label: "드롭다운 Radius", type: "size", unit: "px", min: 0, max: 20 },
      { key: "--select-content-shadow", label: "드롭다운 그림자", type: "shadow" },
      { key: "--select-item-height", label: "항목 높이", type: "size", unit: "px", min: 24, max: 56 },
      { key: "--select-item-font-size", label: "항목 폰트 크기", type: "font-size", unit: "px", min: 10, max: 18 },
    ],
  },
  {
    id: "avatar",
    label: "아바타",
    description: "아바타 이미지의 크기, 모서리, 테두리 설정",
    icon: "UserCircle",
    usedIn: ["마이페이지 프로필", "코멘트 작성자", "사용자 정보 표시"],

    tokens: [
      { key: "--avatar-size-sm", label: "크기 SM", type: "size", unit: "px", min: 16, max: 48 },
      { key: "--avatar-size-md", label: "크기 MD", type: "size", unit: "px", min: 24, max: 64 },
      { key: "--avatar-size-lg", label: "크기 LG", type: "size", unit: "px", min: 32, max: 80 },
      { key: "--avatar-size-xl", label: "크기 XL", type: "size", unit: "px", min: 40, max: 96 },
      { key: "--avatar-radius", label: "Radius", type: "size", unit: "px", description: "9999px = 원형" },
      { key: "--avatar-border-width", label: "테두리 두께", type: "size", unit: "px", min: 0, max: 6 },
    ],
  },
];

// 컴포넌트 섹션 ID로 정의 찾기
export function getComponentSection(id: string): ComponentSection | undefined {
  return COMPONENT_TOKEN_DEFINITIONS.find(s => s.id === id);
}

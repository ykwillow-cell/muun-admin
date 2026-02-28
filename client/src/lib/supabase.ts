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
export const storageApi = {
  async uploadThumbnail(file: File): Promise<string> {
    const MAX_SIZE = 3 * 1024 * 1024; // 3MB
    if (file.size > MAX_SIZE) {
      throw new Error(`파일 크기가 3MB를 초과합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('JPG, PNG, GIF, WebP 형식의 이미지만 업로드 가능합니다.');
    }
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage
      .from('column-thumbnails')
      .upload(fileName, file, { upsert: false, contentType: file.type });
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

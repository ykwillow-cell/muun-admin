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

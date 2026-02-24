import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vuifbmsdggnwygvgcrkj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWZibXNkZ2dud3lndmdjcmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzY0ODYsImV4cCI6MjA4NzQ1MjQ4Nn0.PhMK66O73HH98WIPAu66qk8FuXwJLU4Z2bhDcmDCpKI";

// Supabase 클라이언트 설정 최적화
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Column operations
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
    return data || [];
  },
  async create(name: string) {
    const { data, error } = await supabase
      .from("columns")
      .insert([{ name }])
      .select()
      .single();
    if (error) {
      console.error("Supabase create error:", error);
      throw error;
    }
    return data;
  },
  async update(id: string, name: string) {
    const { data, error } = await supabase
      .from("columns")
      .update({ name })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    return data;
  },
  async delete(id: string) {
    const { error } = await supabase.from("columns").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }
  },
};

// Column data operations
export const columnDataApi = {
  async getByColumnId(columnId: string) {
    const { data, error } = await supabase
      .from("column_data")
      .select("*")
      .eq("column_id", columnId)
      .order("row_index", { ascending: true });
    if (error) {
      console.error("Supabase getByColumnId error:", error);
      throw error;
    }
    return data || [];
  },
  async upsert(columnId: string, rowIndex: number, value: string) {
    const { data, error } = await supabase
      .from("column_data")
      .upsert(
        [{ column_id: columnId, row_index: rowIndex, value }],
        { onConflict: "column_id,row_index" }
      )
      .select()
      .single();
    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }
    return data;
  },
  async delete(id: string) {
    const { error } = await supabase.from("column_data").delete().eq("id", id);
    if (error) {
      console.error("Supabase deleteData error:", error);
      throw error;
    }
  },
};

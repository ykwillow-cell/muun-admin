/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

// Supabase types
export interface Column {
  id: string;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface ColumnData {
  id: string;
  column_id: string;
  row_index: number;
  value: string;
  created_at: string;
  updated_at: string;
}

export * from "./_core/errors";

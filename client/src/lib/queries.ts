import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, columnApi, type ColumnFormData } from "./supabase";

// Query keys
export const queryKeys = {
  columns: ["columns"] as const,
  columnDetail: (id: string) => ["columns", id] as const,
  auth: ["auth"] as const,
};

// Columns queries
export function useColumnsList() {
  return useQuery({
    queryKey: queryKeys.columns,
    queryFn: () => columnApi.getAll(),
  });
}

export function useColumn(id: string) {
  return useQuery({
    queryKey: queryKeys.columnDetail(id),
    queryFn: () => columnApi.getById(id),
    enabled: !!id,
  });
}

// Columns mutations
export function useCreateColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: ColumnFormData) => columnApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.columns });
    },
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: Partial<ColumnFormData> }) =>
      columnApi.update(id, formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.columns });
      queryClient.invalidateQueries({
        queryKey: queryKeys.columnDetail(data.id),
      });
    },
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => columnApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.columns });
    },
  });
}

// Auth
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loading } = useQuery({
    queryKey: queryKeys.auth,
    queryFn: getCurrentUser,
  });

  const logoutMutation = useMutation({
    mutationFn: () => supabase.auth.signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth });
    },
  });

  return {
    user,
    loading,
    isLoading: loading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, columnApi, columnDataApi } from "./supabase";

// Query keys
export const queryKeys = {
  columns: ["columns"] as const,
  columnDetail: (id: string) => ["columns", id] as const,
  columnData: (columnId: string) => ["columnData", columnId] as const,
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
    queryFn: async () => {
      const columns = await columnApi.getAll();
      return columns.find((c) => c.id === id);
    },
    enabled: !!id,
  });
}

export function useColumnData(columnId: string) {
  return useQuery({
    queryKey: queryKeys.columnData(columnId),
    queryFn: () => columnDataApi.getByColumnId(columnId),
    enabled: !!columnId,
  });
}

// Columns mutations
export function useCreateColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => columnApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.columns });
    },
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      columnApi.update(id, name),
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

// Column data mutations
export function useUpsertColumnData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      columnId,
      rowIndex,
      value,
    }: {
      columnId: string;
      rowIndex: number;
      value: string;
    }) => columnDataApi.upsert(columnId, rowIndex, value),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.columnData(data.column_id),
      });
    },
  });
}

export function useDeleteColumnData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => columnDataApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.columnData });
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

  const { data: user, isLoading } = useQuery({
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
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
  };
}

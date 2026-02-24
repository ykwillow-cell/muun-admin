import { getLoginUrl } from "@/const";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check current user on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);
        localStorage.setItem(
          "manus-runtime-user-info",
          JSON.stringify(currentUser)
        );
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(session?.user ?? null)
      );
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("manus-runtime-user-info");
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Logout failed"));
      throw err;
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  const state = useMemo(
    () => ({
      user: user ?? null,
      loading: loading || isLoggingOut,
      error: error ?? null,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, error, isLoggingOut]
  );

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading || isLoggingOut) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    isLoggingOut,
    loading,
    state.user,
  ]);

  return {
    ...state,
    refresh: async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
    },
    logout,
  };
}

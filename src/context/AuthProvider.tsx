import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/shared/api/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, signOut: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    // Initialize auth state
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user || null);
      setLoading(false);
    })();

    // Listen to auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Handle different auth events
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setUser(session?.user || null);
      } else if (!session) {
        // Handle cases where session is null (logout, expired, etc.)
        setUser(null);
      }

      // Set up automatic session refresh
      // Supabase auto-refreshes, but we add backup refresh every 50 minutes
      if (session && mounted) {
        if (refreshTimer) clearTimeout(refreshTimer);
        refreshTimer = setTimeout(async () => {
          if (!mounted) return;
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Session refresh error:', error);
          }
        }, 50 * 60 * 1000); // 50 minutes
      }
    });

    return () => {
      mounted = false;
      if (refreshTimer) clearTimeout(refreshTimer);
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

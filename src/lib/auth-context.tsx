import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import type { User as AppUser } from "@/types";

interface AuthContextType {
  supabaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrCreateAppUser = useCallback(async (userId: string, email: string, firstName?: string, lastName?: string) => {
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (existing) {
      setAppUser(existing as AppUser);
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        id: userId,
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        plan: "free",
        session_limit: 10,
        sessions_this_month: 0,
      } as any)
      .select()
      .single();

    if (!error && data) {
      setAppUser(data as AppUser);
    } else if (error) {
      console.error("Error creating app user:", error.message);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabase();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        await loadOrCreateAppUser(
          session.user.id,
          session.user.email || "",
          session.user.user_metadata?.first_name,
          session.user.user_metadata?.last_name
        );
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadOrCreateAppUser]);

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabase();

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { error: error as Error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName }
        }
      });

      if (error) {
        return { error: error as Error };
      }

      if (!data.session) {
        return { error: null, needsConfirmation: true };
      }

      return { error: null, needsConfirmation: false };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ supabaseUser, appUser, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

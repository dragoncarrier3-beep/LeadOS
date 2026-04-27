import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeAuthErrorMessage(message: string) {
  if (!message) return 'Something went wrong. Please try again.';
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: async (email, password) => {
        if (!isSupabaseConfigured) return { error: new Error('Supabase is not configured') };
        // Deterministic UX:
        // 1) Check if the email exists; if not, instruct user to register.
        // 2) If it exists, attempt password login; invalid credentials => "password is incorrect".
        try {
          const { data: exists, error: rpcErr } = await supabase.rpc('user_exists', { p_email: email });
          if (!rpcErr && exists === false) {
            return { error: new Error('No account found for this email. Please register first.') };
          }
        } catch {
          // If RPC isn't available, fall back to Supabase's error message mapping.
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) return { error: null };

        const msg = error.message || '';
        if (/invalid login credentials/i.test(msg)) return { error: new Error('Password is incorrect.') };
        return { error: new Error(normalizeAuthErrorMessage(msg)) };
      },
      signUp: async (email, password, fullName) => {
        if (!isSupabaseConfigured) return { error: new Error('Supabase is not configured') };
        // Prevent sign-up attempts for already-registered emails.
        try {
          const { data: exists, error: rpcErr } = await supabase.rpc('user_exists', { p_email: email });
          if (!rpcErr && exists === true) {
            return { error: new Error('This email is already registered. Please sign in instead.') };
          }
        } catch {
          // If RPC isn't available, proceed and let Supabase return the appropriate error.
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) return { error: new Error(normalizeAuthErrorMessage(error.message)) };

        // If email confirmations are enabled, Supabase will not return a session.
        // Do not attempt an immediate sign-in (it will fail until the email is confirmed).
        if (!data.session) return { error: null, needsEmailConfirmation: true };

        return { error: null, needsEmailConfirmation: false };
      },
      signOut: async () => {
        if (!isSupabaseConfigured) return;
        await supabase.auth.signOut();
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

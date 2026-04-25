import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const memoryStorage = {
  getItem: (_key: string) => Promise.resolve(null as string | null),
  setItem: (_key: string, _value: string) => Promise.resolve(),
  removeItem: (_key: string) => Promise.resolve(),
};

const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

function getSupabaseConfig() {
  if (!url || !anonKey) {
    return {
      client: null as ReturnType<typeof createClient> | null,
      missingEnv: true as const,
    };
  }
  return {
    client: createClient(url, anonKey, {
      auth: {
        storage: secureStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }),
    missingEnv: false as const,
  };
}

/** Fallback when env is missing (e.g. CI) so imports do not throw at module load. */
export const supabase =
  getSupabaseConfig().client ??
  createClient('https://placeholder.supabase.co', 'placeholder', {
    auth: { storage: memoryStorage },
  });

export const isSupabaseConfigured = Boolean(url && anonKey);

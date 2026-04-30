import { createClient } from "@supabase/supabase-js";
import { env, featureFlags } from "./env";

export function createBrowserSupabaseClient() {
  if (!featureFlags.supabase) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}

export function createServerSupabaseClient() {
  if (!featureFlags.supabase) {
    return null;
  }

  return createClient(
    env.supabaseUrl,
    env.supabaseServiceRoleKey || env.supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

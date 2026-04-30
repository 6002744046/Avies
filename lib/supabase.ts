import { createClient } from "@supabase/supabase-js";
import { env, featureFlags } from "./env";

export function createBrowserSupabaseClient() {
  if (!featureFlags.supabase) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}

export function createSupabaseAuthClient() {
  if (!featureFlags.supabase) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function createSupabaseAdminClient() {
  if (!featureFlags.supabaseAdmin) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
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

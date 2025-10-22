import { createBrowserClient } from "@supabase/ssr";
import { requireEnv } from "@utils/env";

export const createClient = () =>
  createBrowserClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );

"use server";

import { createServerSupabase } from "@lib/supabase/server.supabase";
import { createProfilesApi } from "./api";
import type { CreateProfileInput, CreateProfileOptions } from "./schemas";

export async function fetchProfilesServer() {
  const supabase = await createServerSupabase();
  return createProfilesApi(supabase).fetchProfiles();
}

export async function fetchProfileByEmailServer(email: string) {
  const supabase = await createServerSupabase();
  return createProfilesApi(supabase).fetchProfileByEmail(email);
}

export async function fetchAllowedEmailByEmailServer(email: string) {
  const supabase = await createServerSupabase();
  return createProfilesApi(supabase).fetchAllowedEmailByEmail(email);
}

export async function createProfileServer(
  payload: CreateProfileInput,
  options: CreateProfileOptions,
) {
  const supabase = await createServerSupabase();
  return createProfilesApi(supabase).createProfile(payload, options);
}

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type AllowedEmailRow,
  allowedEmailRowSchema,
  type CreateProfileInput,
  type CreateProfileOptions,
  createProfileInputSchema,
  type ProfileRow,
  profileRowSchema,
} from "./schemas";

const PROFILE_SELECT = "id, email, name, role, created_at, updated_at";
const ALLOWED_EMAIL_SELECT =
  "email, role, invited_by, is_login_allowed, created_at, updated_at";

type AnySupabaseClient = SupabaseClient;

type RawProfileRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string | null;
  updated_at: string | null;
};

type RawAllowedEmailRow = {
  email: string;
  role: string;
  invited_by: string | null;
  is_login_allowed: boolean;
  created_at: string | null;
  updated_at: string | null;
};

const mapProfileRow = (row: RawProfileRow) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapAllowedEmailRow = (row: RawAllowedEmailRow) => ({
  email: row.email,
  role: row.role,
  invitedBy: row.invited_by,
  isLoginAllowed: row.is_login_allowed,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

async function fetchProfileByEmail(
  client: AnySupabaseClient,
  email: string,
): Promise<ProfileRow | null> {
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return profileRowSchema.parse(mapProfileRow(data));
}

async function fetchAllowedEmailByEmail(
  client: AnySupabaseClient,
  email: string,
): Promise<AllowedEmailRow | null> {
  const { data, error } = await client
    .from("allowed_emails")
    .select(ALLOWED_EMAIL_SELECT)
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return allowedEmailRowSchema.parse(mapAllowedEmailRow(data));
}

async function fetchProfiles(client: AnySupabaseClient): Promise<ProfileRow[]> {
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return profileRowSchema.array().parse(data.map(mapProfileRow));
}

async function createProfile(
  client: AnySupabaseClient,
  payload: CreateProfileInput,
  options: CreateProfileOptions,
): Promise<ProfileRow> {
  const parsedPayload = createProfileInputSchema.parse(payload);

  const { error: whitelistError } = await client.from("allowed_emails").upsert(
    {
      email: parsedPayload.email,
      role: parsedPayload.role ?? "editor",
      invited_by: options.invitedByProfileId,
      is_login_allowed: true,
    },
    { onConflict: "email" },
  );

  if (whitelistError) throw whitelistError;

  const { data, error } = await client
    .from("profiles")
    .insert({
      email: parsedPayload.email,
      name: parsedPayload.name,
      role: parsedPayload.role ?? "editor",
    })
    .select(PROFILE_SELECT)
    .single();

  if (error) throw error;
  if (!data) throw new Error("프로필 생성에 실패했습니다.");

  return profileRowSchema.parse(mapProfileRow(data));
}

export function createProfilesApi(client: AnySupabaseClient) {
  return {
    fetchProfileByEmail: (email: string) => fetchProfileByEmail(client, email),
    fetchAllowedEmailByEmail: (email: string) =>
      fetchAllowedEmailByEmail(client, email),
    fetchProfiles: () => fetchProfiles(client),
    createProfile: (
      payload: CreateProfileInput,
      options: CreateProfileOptions,
    ) => createProfile(client, payload, options),
  };
}

export type ProfilesApi = ReturnType<typeof createProfilesApi>;

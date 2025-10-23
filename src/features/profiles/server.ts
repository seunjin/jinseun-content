"use server";

import { createServerSupabase } from "@lib/supabase/server.supabase";
import { createProfilesApi } from "./api";
import type { CreateProfileInput, CreateProfileOptions } from "./schemas";

/**
 * @description 서버에서 전체 프로필 목록을 조회합니다.
 * - 보호 라우트의 데이터 패칭, SSG/SSR 등에 사용합니다.
 */
export async function fetchProfilesServer() {
  const supabase = await createServerSupabase();
  return createProfilesApi(supabase).fetchProfiles();
}

/**
 * @description 이메일 기준으로 단일 프로필을 조회합니다.
 */
export async function fetchProfileByEmailServer(email: string) {
  const supabase = await createServerSupabase();
  return createProfilesApi(supabase).fetchProfileByEmail(email);
}

/**
 * @description 허용 이메일 정보를 조회해 로그인 가능 여부를 확인합니다.
 */
export async function fetchAllowedEmailByEmailServer(email: string) {
  const supabase = await createServerSupabase();
  return createProfilesApi(supabase).fetchAllowedEmailByEmail(email);
}

/**
 * @description 관리자 초대를 포함한 신규 프로필 생성을 수행합니다.
 */
export async function createProfileServer(
  payload: CreateProfileInput,
  options: CreateProfileOptions,
) {
  const supabase = await createServerSupabase();
  return createProfilesApi(supabase).createProfile(payload, options);
}

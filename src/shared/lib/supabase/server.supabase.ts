import { createProfilesApi } from "@features/profiles/api";
import type { ProfileRow } from "@features/profiles/schemas";
import { requireEnv } from "@shared/utils/env";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Server Component·Route Handler에서 사용할 Supabase 클라이언트를 생성합니다.
 * middleware가 세션 쿠키를 갱신하고 있으므로 여기서는 갱신 실패를 무시해도 안전합니다.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component에서는 쿠키 쓰기가 금지되어 있으므로 무시합니다.
            // middleware에서 쿠키를 갱신해 주므로 세션이 유지됩니다.
          }
        },
      },
    },
  );
}

/**
 * @description 서버 환경에서 현재 사용자 정보를 조회합니다. 서버 컴포넌트/Route Handler에서 사용하세요.
 */
export const getServerSession = async () => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
};

/**
 * @description 현재 세션의 이메일을 기준으로 프로필 정보를 조회합니다.
 * - 로그인하지 않은 경우에는 null을 반환합니다.
 */
export const getSessionWithUser = async (): Promise<{
  user: ProfileRow | null;
}> => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.email) {
    return {
      user: null,
    };
  }

  const user = await createProfilesApi(supabase).fetchProfileByEmail(
    data.user.email,
  );

  return { user };
};

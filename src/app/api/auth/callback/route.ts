import { requireEnv } from "@shared/utils/env";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * @description Supabase OAuth 콜백을 처리합니다.
 * - code가 존재하면 세션을 교환하고, next 파라미터로 리다이렉트합니다.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const appOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const next = requestUrl.searchParams.get("next") ?? "/admin";

  const redirectUrl = new URL(next, appOrigin);
  redirectUrl.searchParams.delete("code");
  redirectUrl.searchParams.delete("state");

  if (error) {
    redirectUrl.pathname = "/admin/signin";
    redirectUrl.search = `error=${encodeURIComponent(
      errorDescription ?? error,
    )}`;
  }

  const response = NextResponse.redirect(redirectUrl);

  if (!code) {
    return response;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.exchangeCodeForSession(code);

  return response;
}

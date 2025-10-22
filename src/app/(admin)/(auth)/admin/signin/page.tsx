"use client";

import { createClient } from "@lib/supabase/client.supabase";
import { cn } from "@shadcn/lib/utils";
import { Button } from "@shadcn/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

/**
 * @description /admin 영역 전용 Google OAuth 로그인 페이지입니다.
 * - 개별 버튼만 제공하고, 성공 시 Supabase OAuth 콜백으로 이동합니다.
 */
export default function AdminSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(
    () => searchParams.get("next") ?? "/admin",
    [searchParams],
  );
  const hydratedError = useMemo(
    () => searchParams.get("error"),
    [searchParams],
  );

  const handleSignIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const callbackUrl = new URL("/api/auth/callback", origin);
      callbackUrl.searchParams.set("next", nextPath);

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }
      // OAuth 흐름으로 이동하므로 추가 동작은 필요 없지만, 오류 대비용으로 남겨둡니다.
      router.prefetch("/admin");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "알 수 없는 오류가 발생했습니다.",
      );
      setIsLoading(false);
    }
  }, [nextPath, router]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <section className="w-full max-w-sm space-y-6 rounded-2xl border border-border/60 bg-background/75 p-8 text-center shadow-sm backdrop-blur">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">관리자 로그인</h1>
          <p className="text-sm text-muted-foreground">
            Google 계정으로 로그인해야 관리자 페이지를 사용할 수 있습니다.
          </p>
        </header>

        {(hydratedError || error) && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {hydratedError ?? error}
          </p>
        )}

        <Button
          type="button"
          onClick={handleSignIn}
          disabled={isLoading}
          className={cn("w-full", isLoading && "cursor-not-allowed opacity-80")}
        >
          {isLoading ? "로그인 이동 중..." : "Google로 계속하기"}
        </Button>

        <p className="text-xs text-muted-foreground">
          허용된 이메일이 아닌 경우 접근할 수 없습니다. 문제가 있다면 운영자에게
          문의해 주세요.
        </p>
      </section>
    </main>
  );
}

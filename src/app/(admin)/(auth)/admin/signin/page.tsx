"use client";

import { createClient } from "@shared/lib/supabase/client.supabase";
import Icon from "@ui/components/lucide-icons/Icon";
import AppContainer from "@ui/layouts/AppContainer";
import Main from "@ui/layouts/Main";
import { Button } from "@ui/shadcn/components/button";
import { cn } from "@ui/shadcn/lib/utils";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

/**
 * @description /admin 영역 전용 Google OAuth 로그인 페이지입니다.
 * - 개별 버튼만 제공하고, 성공 시 Supabase OAuth 콜백으로 이동합니다.
 */
export default function AdminSignInPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appOrigin =
    process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000";

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
      const callbackUrl = new URL("/api/auth/callback", appOrigin);
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
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "알 수 없는 오류가 발생했습니다.",
      );
      setIsLoading(false);
    }
  }, [appOrigin, nextPath]);

  return (
    <AppContainer className="grid-rows-[1fr]">
      <Main>
        <div className="flex items-center  h-full">
          <section className="w-full mx-auto  max-w-sm space-y-6 rounded-2xl border border-border/60 bg-background/75 p-8 text-center shadow-sm backdrop-blur">
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
              className={cn(
                "w-full",
                isLoading && "cursor-not-allowed opacity-80",
              )}
            >
              {isLoading ? (
                <Icon
                  name="LoaderCircle"
                  className="animate-spin size-[18px]"
                />
              ) : (
                <>
                  <Image
                    src="/assets/icons/google.svg"
                    alt="@GOOGlE LOGO"
                    width={18}
                    height={18}
                  />
                  Google Login
                </>
              )}
            </Button>

            <div>
              <p className="text-xs text-muted-foreground">
                허용된 이메일이 아닌 경우 접근할 수 없습니다.
              </p>
              <p className="text-xs text-muted-foreground">
                문제가 있다면 운영자에게 문의해 주세요.
              </p>
            </div>
          </section>
        </div>
      </Main>
    </AppContainer>
  );
}

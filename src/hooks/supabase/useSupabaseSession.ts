"use client";

import { createClient } from "@lib/supabase/client.supabase";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export type UseSupabaseSessionResult = {
  /** 현재 로그인 세션. 없으면 null */
  session: Session | null;
  /** 초기 세션 조회 및 상태 전환 중인지 여부 */
  isLoading: boolean;
  /** 세션 존재 여부를 boolean으로 제공 */
  isAuthenticated: boolean;
};

/**
 * @description 브라우저에서 Supabase 세션 상태를 구독하는 훅입니다.
 * - 첫 마운트 시 `auth.getSession()`으로 즉시 세션을 불러옵니다.
 * - 이후 `onAuthStateChange` 이벤트를 구독해 로그인/로그아웃 변화를 감지합니다.
 */
export const useSupabaseSession = (): UseSupabaseSessionResult => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Supabase 클라이언트는 브라우저에서만 생성하도록 별도 헬퍼를 사용합니다.
    const supabase = createClient();

    // 초기 세션을 한 번 불러와 현재 상태를 채웁니다.
    const prepareSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setIsLoading(false);
    };

    void prepareSession();

    // 로그인/로그아웃 이벤트를 구독해 상태를 최신으로 유지합니다.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    isLoading,
    isAuthenticated: Boolean(session),
  };
};

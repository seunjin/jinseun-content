"use client";

import { createClient } from "@lib/supabase/client.supabase";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export type UseSupabaseSessionResult = {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

/**
 * @description 브라우저에서 Supabase 세션 상태를 구독하는 훅입니다.
 * - 초기 마운트 시 세션을 한 번 조회하고, 이후 auth 상태 변경을 구독합니다.
 */
export const useSupabaseSession = (): UseSupabaseSessionResult => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const prepareSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setIsLoading(false);
    };

    void prepareSession();

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

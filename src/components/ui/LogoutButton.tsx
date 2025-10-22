"use client";

import { createClient } from "@lib/supabase/client.supabase";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const supabase = createClient();

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm font-medium"
    >
      로그아웃
    </button>
  );
}

"use client";

import { createClient } from "@shared/lib/supabase/client.supabase";
import { Button } from "@ui/shadcn/components";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Icon from "./lucide-icons/Icon";

const supabase = createClient();

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <Button
      variant={"ghost"}
      size={"icon-sm"}
      type="button"
      onClick={handleLogout}
    >
      <Icon name="LogOut" />
    </Button>
  );
}

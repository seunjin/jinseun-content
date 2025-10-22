import { createServerSupabase } from "@lib/supabase/server.supabase";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // 로그인 페이지로 리다이렉트하거나 커스텀 로그인 컴포넌트 렌더
    redirect("/admin/signin"); // 또는 <LoginScreen />을 반환
  }
  return <>{children}</>;
}

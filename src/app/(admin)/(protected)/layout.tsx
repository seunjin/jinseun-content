import { getSessionWithUser } from "@shared/lib/supabase/server.supabase";
import AppContainer from "@ui/layouts/AppContainer";
import AppHeader from "@ui/layouts/app-header/AppHeader";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, user } = await getSessionWithUser();
  if (!session) {
    // 로그인 페이지로 리다이렉트하거나 커스텀 로그인 컴포넌트 렌더
    redirect("/admin/signin"); // 또는 <LoginScreen />을 반환
  }
  return (
    <AppContainer className="grid-rows-[auto_1fr]">
      <AppHeader session={session} user={user} />
      {children}
    </AppContainer>
  );
}

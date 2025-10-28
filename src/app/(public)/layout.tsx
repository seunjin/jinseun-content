import { getSessionWithUser } from "@shared/lib/supabase/server.supabase";
import AppContainer from "@ui/layouts/AppContainer";
import AppFooter from "@ui/layouts/AppFooter";
import AppHeader from "@ui/layouts/app-header/AppHeader";

const PublicLayout = async ({ children }: { children: React.ReactNode }) => {
  const { session, user } = await getSessionWithUser();
  return (
    <AppContainer>
      <AppHeader session={session} user={user} />
      {children}
      <AppFooter />
    </AppContainer>
  );
};

export default PublicLayout;

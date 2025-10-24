import type { ProfileRow } from "@features/profiles/schemas";
import type { Session } from "@supabase/supabase-js";
import MobileHeader from "./Header.mobile";
import PCHeader from "./Header.pc";

export type AppHeaderProps = {
  session: Session | null;
  user: ProfileRow | null;
};

const AppHeader = ({ session, user }: AppHeaderProps) => {
  return (
    <>
      <MobileHeader session={session} user={user} />
      <PCHeader session={session} user={user} />
    </>
  );
};

export default AppHeader;

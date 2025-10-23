import AppFooter from "@ui/layouts/AppFooter";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <AppFooter />
    </>
  );
};

export default PublicLayout;

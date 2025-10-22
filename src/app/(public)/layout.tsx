import AppFooter from "@components/layouts/AppFooter";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <AppFooter />
    </>
  );
};

export default PublicLayout;

import AppFooter from "@components/layouts/AppFooter";
import React from "react";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <AppFooter />
    </>
  );
};

export default PublicLayout;

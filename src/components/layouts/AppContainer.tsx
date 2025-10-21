import { cn } from "@shadcn/lib/utils";
import React from "react";

const AppContainer = ({ children }: { children?: React.ReactNode }) => {
  return <main className={cn("main-container", "py-6")}>{children}</main>;
};

export default AppContainer;

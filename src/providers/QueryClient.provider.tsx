"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";

const queryClient = new QueryClient();

const NextQueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default NextQueryClientProvider;

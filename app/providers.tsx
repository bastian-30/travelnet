"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../src/context/AuthContext";
import { ViewNavigationProvider } from "../src/context/NavigationContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ViewNavigationProvider>{children}</ViewNavigationProvider>
    </AuthProvider>
  );
}

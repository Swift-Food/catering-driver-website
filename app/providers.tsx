"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { DriverProvider } from "@/lib/drivers";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DriverProvider>{children}</DriverProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

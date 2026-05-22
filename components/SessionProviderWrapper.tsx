"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function SessionProviderWrapper({ children }: { children: ReactNode }) {
  // Guest-first: don't refetch sessions on focus or interval. The UI works
  // without a session, so we only need to know about it on mount.
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      {children}
    </SessionProvider>
  );
}

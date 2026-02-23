"use client";

import { ReactNode } from "react";

/**
 * Placeholder for protected route wrapper.
 * Wire to auth (e.g. useUser) and redirect to login when unauthenticated.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

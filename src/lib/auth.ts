import type { UserRole } from "@prisma/client";

/**
 * Authentication is disabled for open demo / client preview.
 * Helpers remain so existing call sites keep working.
 */

export const SESSION_COOKIE = "hk_session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

const DEMO_ADMIN: SessionUser = {
  id: "demo-admin",
  email: "demo@local",
  name: "Demo",
  role: "ADMIN",
};

export async function getSession(): Promise<SessionUser | null> {
  return DEMO_ADMIN;
}

export async function requireSession(): Promise<SessionUser> {
  return DEMO_ADMIN;
}

export async function requireAdmin(): Promise<SessionUser> {
  return DEMO_ADMIN;
}

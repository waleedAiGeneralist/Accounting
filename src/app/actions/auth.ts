"use server";

/**
 * Cookie auth is handled by /api/auth/login and /api/auth/logout.
 * Kept as a thin module so older imports do not break the build.
 */
export type LoginResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

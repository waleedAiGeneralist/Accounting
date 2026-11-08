"use server";

import { headers } from "next/headers";
import {
  authenticate,
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { ensureUsers } from "@/lib/ensure-users";
import { rateLimit } from "@/lib/rate-limit";
import { safeRedirectPath } from "@/lib/safe-redirect";

export type LoginResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

export async function loginAction(form: {
  email: string;
  password: string;
  next?: string;
}): Promise<LoginResult> {
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown";
    const emailKey = form.email.trim().toLowerCase() || "empty";
    const limited = rateLimit(`login:${ip}:${emailKey}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return {
        ok: false,
        error: `Too many attempts. Try again in ${limited.retryAfterSec}s`,
      };
    }

    // Create missing accounts only — never re-hash on every login attempt.
    try {
      await ensureUsers({ updateExisting: false });
    } catch (e) {
      console.error("login ensureUsers", e);
    }

    const user = await authenticate(form.email, form.password);
    if (!user) return { ok: false, error: "Invalid email or password" };

    const token = await createSessionToken(user);
    await setSessionCookie(token);
    return { ok: true, redirectTo: safeRedirectPath(form.next) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed";
    console.error("loginAction", msg);
    if (msg.includes("AUTH_SECRET")) {
      return { ok: false, error: "Server auth is not configured" };
    }
    return { ok: false, error: "Login failed — please try again" };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  return { ok: true as const };
}

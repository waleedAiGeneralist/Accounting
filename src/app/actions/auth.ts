"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  authenticate,
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { ensureUsers } from "@/lib/ensure-users";
import { rateLimit } from "@/lib/rate-limit";
import { safeRedirectPath } from "@/lib/safe-redirect";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function loginAction(form: {
  email: string;
  password: string;
  next?: string;
}): Promise<LoginResult> {
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

  // Make sure seed accounts exist in this app's Postgres (runtime secrets).
  try {
    await ensureUsers();
  } catch (e) {
    console.error("login ensureUsers", e);
  }

  let user;
  try {
    user = await authenticate(form.email, form.password);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed";
    if (msg.includes("AUTH_SECRET")) {
      return { ok: false, error: "Server auth is not configured" };
    }
    return { ok: false, error: "Login failed — please try again" };
  }

  if (!user) return { ok: false, error: "Invalid email or password" };

  try {
    const token = await createSessionToken(user);
    await setSessionCookie(token);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Session failed";
    if (msg.includes("AUTH_SECRET")) {
      return { ok: false, error: "Server auth is not configured" };
    }
    return { ok: false, error: "Could not create session" };
  }

  redirect(safeRedirectPath(form.next));
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

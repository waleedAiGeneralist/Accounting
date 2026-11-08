"use server";

import { redirect } from "next/navigation";
import {
  authenticate,
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function loginAction(form: {
  email: string;
  password: string;
  next?: string;
}): Promise<LoginResult> {
  let user;
  try {
    user = await authenticate(form.email, form.password);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed";
    if (msg.includes("AUTH_SECRET")) {
      return { ok: false, error: "Server auth is not configured" };
    }
    return { ok: false, error: msg };
  }

  if (!user) return { ok: false, error: "Invalid email or password" };

  const token = await createSessionToken(user);
  await setSessionCookie(token);
  redirect(form.next && form.next.startsWith("/") ? form.next : "/");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

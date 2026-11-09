import { NextResponse } from "next/server";
import {
  authenticate,
  createSessionToken,
  SESSION_COOKIE,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { assertAuthSecretConfigured } from "@/lib/seed-policy";

const SESSION_DAYS = 14;

export async function POST(req: Request) {
  try {
    try {
      assertAuthSecretConfigured();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Server auth is not configured" },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => null)) as {
      email?: string;
      password?: string;
      next?: string;
    } | null;

    const email = body?.email?.trim() ?? "";
    const password = body?.password ?? "";
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ipLimit = await rateLimit(`login:ip:${ip}`, {
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    if (!ipLimit.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Too many attempts. Try again in ${ipLimit.retryAfterSec}s`,
        },
        { status: 429 }
      );
    }
    const emailLimit = await rateLimit(`login:email:${email.toLowerCase()}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!emailLimit.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Too many attempts. Try again in ${emailLimit.retryAfterSec}s`,
        },
        { status: 429 }
      );
    }

    const user = await authenticate(email, password);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user);
    const res = NextResponse.json({
      ok: true,
      redirectTo: safeRedirectPath(body?.next),
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    });
    return res;
  } catch (e) {
    console.error("api login", e);
    return NextResponse.json(
      { ok: false, error: "Login failed — please try again" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import {
  authenticate,
  createSessionToken,
  SESSION_COOKIE,
} from "@/lib/auth";
import { ensureUsers } from "@/lib/ensure-users";
import { rateLimit } from "@/lib/rate-limit";
import { safeRedirectPath } from "@/lib/safe-redirect";

const SESSION_DAYS = 14;

export async function POST(req: Request) {
  try {
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
    const limited = rateLimit(`login:${ip}:${email.toLowerCase()}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Too many attempts. Try again in ${limited.retryAfterSec}s`,
        },
        { status: 429 }
      );
    }

    try {
      await ensureUsers({ updateExisting: false });
    } catch (e) {
      console.error("api login ensureUsers", e);
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
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed";
    console.error("api login", msg);
    if (msg.includes("AUTH_SECRET")) {
      return NextResponse.json(
        { ok: false, error: "Server auth is not configured" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Login failed — please try again" },
      { status: 500 }
    );
  }
}

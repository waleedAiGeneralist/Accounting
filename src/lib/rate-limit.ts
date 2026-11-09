import { prisma } from "./prisma";

/**
 * Shared Postgres-backed limiter (works across instances / restarts).
 * Falls back to denying closed if the table is unavailable.
 */
export async function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const now = Date.now();
  const resetAt = new Date(now + opts.windowMs);

  try {
    const existing = await prisma.loginAttempt.findUnique({ where: { key } });

    if (!existing || existing.resetAt.getTime() <= now) {
      await prisma.loginAttempt.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return { ok: true };
    }

    if (existing.count >= opts.limit) {
      return {
        ok: false,
        retryAfterSec: Math.max(
          1,
          Math.ceil((existing.resetAt.getTime() - now) / 1000)
        ),
      };
    }

    await prisma.loginAttempt.update({
      where: { key },
      data: { count: existing.count + 1 },
    });
    return { ok: true };
  } catch (e) {
    console.error("rateLimit: datastore error", e);
    // Fail closed for login brute-force protection.
    return { ok: false, retryAfterSec: 60 };
  }
}

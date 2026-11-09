/** Reject cross-site POST (basic CSRF defense for cookie-auth routes). */
export function isSameOrigin(req: Request): boolean {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) return false;

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  // Non-browser clients without Origin/Referer — allow only in development.
  return process.env.NODE_ENV !== "production";
}

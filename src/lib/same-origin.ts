/** Basic CSRF defense for cookie-authenticated state-changing requests. */
export function isSameOrigin(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site === "cross-site") return false;
  if (site === "same-origin" || site === "same-site" || site === "none") {
    return true;
  }

  const origin = req.headers.get("origin");
  if (!origin) {
    // Browser same-origin POSTs usually send Origin; allow missing only in dev.
    return process.env.NODE_ENV !== "production";
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const candidates = [
    req.headers.get("x-forwarded-host"),
    req.headers.get("host"),
  ]
    .filter(Boolean)
    .flatMap((h) => (h as string).split(","))
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);

  return candidates.some(
    (h) => h === originHost.toLowerCase() || h.endsWith(`.${originHost.toLowerCase()}`)
  );
}

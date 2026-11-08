/**
 * Only allow same-origin relative paths. Reject protocol-relative (//…),
 * scheme URLs, and backslash tricks.
 */
export function safeRedirectPath(next: string | undefined | null): string {
  if (!next) return "/";
  const value = next.trim();
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//")) return "/";
  if (value.includes("\\")) return "/";
  if (value.includes("://")) return "/";
  if (/[\x00-\x1f]/.test(value)) return "/";
  return value;
}

const WEAK_PASSWORDS = new Set(
  [
    "change-me-admin",
    "change-me-user",
    "password",
    "password123",
    "admin",
    "admin123",
    "12345678",
    "1234567890123456",
  ].map((s) => s.toLowerCase())
);

const WEAK_SECRET_FRAGMENTS = [
  "replace-with",
  "change-me",
  "your-secret",
  "example",
];

/** AUTH_SECRET must be long and non-placeholder. */
export function assertAuthSecretConfigured(): void {
  const secret = process.env.AUTH_SECRET?.trim() ?? "";
  if (secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }
  const lower = secret.toLowerCase();
  if (WEAK_SECRET_FRAGMENTS.some((f) => lower.includes(f))) {
    throw new Error("AUTH_SECRET looks like a placeholder");
  }
}

export function isStrongPassword(password: string): boolean {
  if (password.length < 16) return false;
  if (WEAK_PASSWORDS.has(password.toLowerCase())) return false;
  return true;
}

export function seedingAllowed(): boolean {
  return process.env.ALLOW_SEED_USERS === "1";
}

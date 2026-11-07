import { PrismaClient } from "@prisma/client";
import path from "path";

// Ensure DATABASE_URL is available outside of Next.js (scripts, seed helpers).
if (!process.env.DATABASE_URL) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("dotenv").config({ path: path.join(process.cwd(), ".env") });
  } catch {
    // dotenv optional at runtime in Next.js
  }
}

/**
 * Prisma CLI resolves SQLite paths relative to the schema folder (`prisma/`).
 * The app/scripts resolve relative to process.cwd(). Normalize to an absolute
 * path under `<cwd>/prisma/dev.db` when a relative file URL is used.
 */
function resolveSqliteUrl(url: string): string {
  if (!url.startsWith("file:")) return url;
  const raw = url.slice("file:".length);
  if (path.isAbsolute(raw)) return url;
  // file:./dev.db or file:dev.db → <cwd>/prisma/dev.db
  const base = path.basename(raw) || "dev.db";
  const abs = path.join(/*turbopackIgnore: true*/ process.cwd(), "prisma", base);
  return `file:${abs}`;
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = resolveSqliteUrl(process.env.DATABASE_URL);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

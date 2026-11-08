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

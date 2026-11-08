/**
 * Ensure admin + shop user exist from env passwords (never hardcode secrets).
 *
 * Env:
 *   SEED_ADMIN_EMAIL (default admin@hisabkitab.app)
 *   SEED_ADMIN_PASSWORD
 *   SEED_USER_EMAIL (default Naiz@gamil.com)
 *   SEED_USER_PASSWORD
 */
import { config } from "dotenv";
import { ensureUsers } from "../src/lib/ensure-users";
import { prisma } from "../src/lib/prisma";

config();

async function main() {
  try {
    const r = await ensureUsers();
    console.log("seed-users: done", r);
  } catch (e) {
    console.error("seed-users: failed", e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}

main();

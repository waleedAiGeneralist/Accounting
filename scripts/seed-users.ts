/**
 * Ensure admin + shop user exist from env passwords (never hardcode secrets).
 *
 * Env:
 *   SEED_ADMIN_EMAIL (default admin@hisabkitab.app)
 *   SEED_ADMIN_PASSWORD
 *   SEED_USER_EMAIL (default Naiz@gamil.com)
 *   SEED_USER_PASSWORD
 *   SEED_UPDATE_PASSWORDS=1  → reset hashes from env (optional)
 */
import { config } from "dotenv";
import { ensureUsers } from "../src/lib/ensure-users";

config();

ensureUsers()
  .then((r) => {
    console.log("seed-users: done", r);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/prisma");
    await prisma.$disconnect();
  });

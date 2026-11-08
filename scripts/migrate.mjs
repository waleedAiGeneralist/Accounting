/**
 * Apply Prisma migrations when DATABASE_URL is set (Cursor-hosted Postgres).
 * Skips cleanly when unset so builds without a DB still pass.
 */
import { spawnSync } from "node:child_process";
import { config } from "dotenv";

config();

const url = process.env.DATABASE_URL?.trim() ?? "";
if (!url || url.startsWith("file:")) {
  console.log("migrate: nothing to do (no Postgres DATABASE_URL)");
  process.exit(0);
}

console.log("migrate: running prisma migrate deploy…");
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
});
const code = result.status ?? 1;
if (code !== 0) {
  console.error("migrate: deploy failed");
}
process.exit(code);

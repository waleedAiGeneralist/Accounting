/**
 * Seed chart of accounts when the DB is empty (first deploy).
 */
import { spawnSync } from "node:child_process";

const url = process.env.DATABASE_URL?.trim() ?? "";
if (!url || url.startsWith("file:")) {
  console.log("ensure-seed: skip");
  process.exit(0);
}

const check = spawnSync(
  "npx",
  [
    "tsx",
    "-e",
    `
    import { PrismaClient } from "@prisma/client";
    const p = new PrismaClient();
    const n = await p.account.count();
    await p.$disconnect();
    process.exit(n > 0 ? 0 : 2);
    `,
  ],
  { env: process.env, encoding: "utf8" }
);

if (check.status === 0) {
  console.log("ensure-seed: accounts already present");
  process.exit(0);
}

console.log("ensure-seed: seeding chart of accounts…");
const seed = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
  stdio: "inherit",
  env: process.env,
});
process.exit(seed.status ?? 1);

import { PrismaClient } from "@prisma/client";
import { spawnSync } from "node:child_process";
import { config } from "dotenv";

config();

const url = process.env.DATABASE_URL?.trim() ?? "";
if (!url || url.startsWith("file:")) {
  console.log("ensure-seed: skip");
  process.exit(0);
}

const prisma = new PrismaClient();

async function main() {
  const n = await prisma.account.count();
  if (n > 0) {
    console.log("ensure-seed: accounts already present");
    return;
  }
  console.log("ensure-seed: seeding chart of accounts…");
  const seed = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
    stdio: "inherit",
    env: process.env,
  });
  if (seed.status !== 0) process.exit(seed.status ?? 1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

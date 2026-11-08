/**
 * Upsert admin + shop user from env passwords (never hardcode secrets in repo).
 *
 * Required env:
 *   AUTH_SECRET
 *   SEED_ADMIN_EMAIL (default admin@hisabkitab.app)
 *   SEED_ADMIN_PASSWORD
 *   SEED_USER_EMAIL (default Naiz@gamil.com)
 *   SEED_USER_PASSWORD
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

config();

const prisma = new PrismaClient();

async function upsertUser(opts: {
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  password: string;
}) {
  const passwordHash = await bcrypt.hash(opts.password, 12);
  await prisma.user.upsert({
    where: { email: opts.email.toLowerCase() },
    update: {
      name: opts.name,
      role: opts.role,
      passwordHash,
      isActive: true,
    },
    create: {
      email: opts.email.toLowerCase(),
      name: opts.name,
      role: opts.role,
      passwordHash,
      isActive: true,
    },
  });
  console.log(`seed-users: upserted ${opts.role} ${opts.email}`);
}

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@hisabkitab.app").trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim();
  const userEmail = (process.env.SEED_USER_EMAIL || "Naiz@gamil.com").trim();
  const userPassword = process.env.SEED_USER_PASSWORD?.trim();

  if (!adminPassword || !userPassword) {
    console.log("seed-users: skip (SEED_ADMIN_PASSWORD / SEED_USER_PASSWORD not set)");
    return;
  }

  await upsertUser({
    email: adminEmail,
    name: "Admin",
    role: "ADMIN",
    password: adminPassword,
  });
  await upsertUser({
    email: userEmail,
    name: "Naiz",
    role: "USER",
    password: userPassword,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

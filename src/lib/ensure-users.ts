import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

/**
 * Ensure ADMIN + USER rows exist in this app's Postgres from SEED_* env.
 * Upserts so hosted secrets stay in sync with login passwords.
 */
export async function ensureUsers(): Promise<{ upserted: number }> {
  const adminEmail = (
    process.env.SEED_ADMIN_EMAIL || "admin@hisabkitab.app"
  )
    .trim()
    .toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim();
  const userEmail = (process.env.SEED_USER_EMAIL || "Naiz@gamil.com")
    .trim()
    .toLowerCase();
  const userPassword = process.env.SEED_USER_PASSWORD?.trim();

  if (!adminPassword || !userPassword) {
    console.log("ensure-users: skip (seed passwords not set)");
    return { upserted: 0 };
  }

  let upserted = 0;

  async function upsertOne(opts: {
    email: string;
    name: string;
    role: "ADMIN" | "USER";
    password: string;
  }) {
    const passwordHash = await bcrypt.hash(opts.password, 12);
    await prisma.user.upsert({
      where: { email: opts.email },
      update: {
        name: opts.name,
        role: opts.role,
        passwordHash,
        isActive: true,
      },
      create: {
        email: opts.email,
        name: opts.name,
        role: opts.role,
        passwordHash,
        isActive: true,
      },
    });
    upserted += 1;
    console.log(`ensure-users: upserted ${opts.role} ${opts.email}`);
  }

  await upsertOne({
    email: adminEmail,
    name: "Admin",
    role: "ADMIN",
    password: adminPassword,
  });
  await upsertOne({
    email: userEmail,
    name: "Naiz",
    role: "USER",
    password: userPassword,
  });

  return { upserted };
}

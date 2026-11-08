import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

type EnsureOpts = {
  /** When true, refresh password hashes from SEED_* (boot only). */
  updateExisting?: boolean;
};

function requiredSeed() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim();
  const userEmail = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  const userPassword = process.env.SEED_USER_PASSWORD?.trim();

  if (!adminEmail || !adminPassword || !userEmail || !userPassword) {
    return null;
  }
  return { adminEmail, adminPassword, userEmail, userPassword };
}

/**
 * Ensure ADMIN + USER rows exist in this app's Postgres from SEED_* env.
 * Login path should call with updateExisting=false (create missing only).
 */
export async function ensureUsers(
  opts: EnsureOpts = {}
): Promise<{ created: number; updated: number }> {
  const seed = requiredSeed();
  if (!seed) {
    console.log("ensure-users: skip (SEED_* email/password not fully set)");
    return { created: 0, updated: 0 };
  }

  const updateExisting = opts.updateExisting === true;
  let created = 0;
  let updated = 0;

  async function ensureOne(opts: {
    email: string;
    name: string;
    role: "ADMIN" | "USER";
    password: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: opts.email },
      select: { id: true },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          email: opts.email,
          name: opts.name,
          role: opts.role,
          passwordHash: await bcrypt.hash(opts.password, 12),
          isActive: true,
        },
      });
      created += 1;
      console.log(`ensure-users: created ${opts.role} ${opts.email}`);
      return;
    }

    if (updateExisting) {
      await prisma.user.update({
        where: { email: opts.email },
        data: {
          name: opts.name,
          role: opts.role,
          passwordHash: await bcrypt.hash(opts.password, 12),
          isActive: true,
        },
      });
      updated += 1;
      console.log(`ensure-users: updated ${opts.role} ${opts.email}`);
    }
  }

  await ensureOne({
    email: seed.adminEmail,
    name: "Admin",
    role: "ADMIN",
    password: seed.adminPassword,
  });
  await ensureOne({
    email: seed.userEmail,
    name: "Naiz",
    role: "USER",
    password: seed.userPassword,
  });

  return { created, updated };
}

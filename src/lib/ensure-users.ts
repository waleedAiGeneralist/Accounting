import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import {
  assertAuthSecretConfigured,
  isStrongPassword,
  seedingAllowed,
} from "./seed-policy";

type EnsureOpts = {
  /** When true, refresh password hashes from SEED_* (boot only). */
  updateExisting?: boolean;
};

function readSeed() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim();
  const userEmail = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  const userPassword = process.env.SEED_USER_PASSWORD?.trim();

  return { adminEmail, adminPassword, userEmail, userPassword };
}

/**
 * Create/update bootstrap accounts only when ALLOW_SEED_USERS=1 and
 * credentials pass strength checks. Never uses hardcoded emails/passwords.
 */
export async function ensureUsers(
  opts: EnsureOpts = {}
): Promise<{ created: number; updated: number; skipped: boolean }> {
  if (!seedingAllowed()) {
    console.log("ensure-users: skip (ALLOW_SEED_USERS is not 1)");
    return { created: 0, updated: 0, skipped: true };
  }

  try {
    assertAuthSecretConfigured();
  } catch (e) {
    console.error("ensure-users: refuse seed —", e);
    return { created: 0, updated: 0, skipped: true };
  }

  const seed = readSeed();
  if (!seed.adminEmail || !seed.adminPassword) {
    console.log("ensure-users: skip (SEED_ADMIN_EMAIL/PASSWORD not set)");
    return { created: 0, updated: 0, skipped: true };
  }
  if (!isStrongPassword(seed.adminPassword)) {
    console.error("ensure-users: refuse weak SEED_ADMIN_PASSWORD");
    return { created: 0, updated: 0, skipped: true };
  }

  const updateExisting = opts.updateExisting === true;
  let created = 0;
  let updated = 0;

  async function ensureOne(account: {
    email: string;
    name: string;
    role: "ADMIN" | "USER";
    password: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: account.email },
      select: { id: true },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          email: account.email,
          name: account.name,
          role: account.role,
          passwordHash: await bcrypt.hash(account.password, 12),
          isActive: true,
        },
      });
      created += 1;
      console.log(`ensure-users: created ${account.role}`);
      return;
    }

    if (updateExisting) {
      await prisma.user.update({
        where: { email: account.email },
        data: {
          name: account.name,
          role: account.role,
          passwordHash: await bcrypt.hash(account.password, 12),
          isActive: true,
        },
      });
      updated += 1;
      console.log(`ensure-users: updated ${account.role}`);
    }
  }

  await ensureOne({
    email: seed.adminEmail,
    name: "Admin",
    role: "ADMIN",
    password: seed.adminPassword,
  });

  // Optional read-only shop user — only if both email and strong password set.
  if (seed.userEmail && seed.userPassword) {
    if (!isStrongPassword(seed.userPassword)) {
      console.error("ensure-users: refuse weak SEED_USER_PASSWORD");
    } else {
      await ensureOne({
        email: seed.userEmail,
        name: "Shop user",
        role: "USER",
        password: seed.userPassword,
      });
    }
  }

  return { created, updated, skipped: false };
}

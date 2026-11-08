/**
 * Migrate + seed chart/users. Never throws to the parent for soft mode;
 * used by start. Exit non-zero only when STRICT_DB_SETUP=1.
 */
import { spawnSync } from "node:child_process";

const strict = process.env.STRICT_DB_SETUP === "1";

function run(label, command, args) {
  console.log(`db-setup: ${label}…`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: false,
  });
  const code = result.status ?? 1;
  if (code !== 0) {
    console.error(`db-setup: ${label} failed (exit ${code})`);
    if (strict) process.exit(code);
    return false;
  }
  return true;
}

run("migrate", "node", ["scripts/migrate.mjs"]);
run("ensure-seed", "npx", ["tsx", "scripts/ensure-seed.ts"]);
run("seed-users", "npx", ["tsx", "scripts/seed-users.ts"]);
console.log("db-setup: done");

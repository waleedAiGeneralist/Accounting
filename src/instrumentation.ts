export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    // Apply migrations even if the host runs `next start` without npm scripts.
    const { spawnSync } = await import("node:child_process");
    spawnSync("npx", ["prisma", "migrate", "deploy"], {
      stdio: "inherit",
      env: process.env,
    });
  } catch (e) {
    console.error("instrumentation: migrate failed", e);
  }
  try {
    const { ensureUsers } = await import("./lib/ensure-users");
    await ensureUsers({ updateExisting: true });
  } catch (e) {
    console.error("instrumentation: ensure-users failed", e);
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { spawnSync } = await import("node:child_process");
    spawnSync("npx", ["prisma", "migrate", "deploy"], {
      stdio: "inherit",
      env: process.env,
    });
  } catch (e) {
    console.error("instrumentation: migrate failed", e);
  }
}

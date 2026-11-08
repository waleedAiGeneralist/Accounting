export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { ensureUsers } = await import("./lib/ensure-users");
    // Sync passwords from SEED_* once per cold start.
    await ensureUsers({ updateExisting: true });
  } catch (e) {
    console.error("instrumentation: ensure-users failed", e);
  }
}

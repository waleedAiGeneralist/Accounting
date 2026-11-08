export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { ensureUsers } = await import("./lib/ensure-users");
    await ensureUsers();
  } catch (e) {
    console.error("instrumentation: ensure-users failed", e);
  }
}

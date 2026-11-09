import { config } from "dotenv";
config({ path: "/workspace/.env" });
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";
const secret = process.env.AUTH_SECRET;
const results = [];

function ok(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
}

async function makeToken(email) {
  const prisma = new PrismaClient();
  const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  await prisma.$disconnect();
  if (!u) throw new Error("missing user " + email);
  return new SignJWT({ email: u.email, name: u.name, role: u.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(u.id)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secret));
}

async function req(path, opts = {}) {
  const headers = {
    Origin: BASE.replace(/\/$/, ""),
    ...(opts.headers || {}),
  };
  const res = await fetch(BASE + path, { redirect: "manual", ...opts, headers });
  const text = await res.text().catch(() => "");
  return { status: res.status, location: res.headers.get("location"), text, headers: res.headers };
}

async function main() {
  // passwords
  const prisma = new PrismaClient();
  for (const [email, pw] of [
    ["admin@hisabkitab.app", process.env.SEED_ADMIN_PASSWORD],
    ["naiz@gamil.com", process.env.SEED_USER_PASSWORD],
  ]) {
    const u = await prisma.user.findUnique({ where: { email } });
    const match = u && (await bcrypt.compare(pw, u.passwordHash));
    ok(`db password ${email}`, !!match, u ? u.role : "missing");
  }
  await prisma.$disconnect();

  // health
  const health = await req("/api/health");
  ok("health", health.status === 200 && health.text.includes("ok"));

  // unauth redirects
  for (const path of ["/", "/vouchers", "/settings", "/reports", "/parties", "/stock", "/accounts"]) {
    const r = await req(path);
    ok(`unauth ${path} -> login`, r.status === 307 || r.status === 302, `status=${r.status} loc=${r.location}`);
  }

  // login page
  const login = await req("/login?next=%2F");
  ok("login page 200", login.status === 200);
  ok("login has Sign in", login.text.includes("Sign in"));
  ok("login no This page couldn't load", !login.text.includes("couldn't load"));

  // backup unauth
  const backup401 = await req("/api/backup");
  ok("backup unauth 401", backup401.status === 401);

  // admin session
  const adminTok = await makeToken("admin@hisabkitab.app");
  const adminCookie = { headers: { Cookie: `hk_session=${adminTok}` } };
  const adminHome = await req("/", adminCookie);
  ok("admin home 200", adminHome.status === 200, `status=${adminHome.status}`);
  ok("admin home has content", adminHome.text.includes("Hisab") || adminHome.text.includes("Dashboard") || adminHome.text.length > 1000);

  for (const path of ["/vouchers", "/parties", "/stock", "/accounts", "/settings", "/reports", "/reports/trial-balance", "/reports/balance-sheet", "/reports/profit-loss", "/search?q=rice", "/vouchers/cash", "/vouchers/sale"]) {
    const r = await req(path, adminCookie);
    ok(`admin ${path}`, r.status === 200, `status=${r.status} len=${r.text.length}`);
  }

  const adminBackup = await req("/api/backup", adminCookie);
  ok("admin backup 200", adminBackup.status === 200, `status=${adminBackup.status}`);
  ok("admin backup json", adminBackup.text.includes("accounts"));

  // user session
  const userTok = await makeToken("naiz@gamil.com");
  const userCookie = { headers: { Cookie: `hk_session=${userTok}` } };
  const userHome = await req("/", userCookie);
  ok("user home 200", userHome.status === 200);
  const userBackup = await req("/api/backup", userCookie);
  ok("user backup denied", userBackup.status === 401 || userBackup.status === 403, `status=${userBackup.status}`);

  // settings shows role
  const settings = await req("/settings", adminCookie);
  ok("settings shows admin email", settings.text.toLowerCase().includes("admin@hisabkitab.app"));

  // login already-auth redirects away
  const loginAuthed = await req("/login", adminCookie);
  ok("authed /login redirects", loginAuthed.status === 307 || loginAuthed.status === 302, `status=${loginAuthed.status}`);

  // API login (browser-like Origin header required in production)
  {
    const origin = BASE.replace(/\/$/, "");
    async function apiLogin(email, password) {
      const res = await fetch(BASE + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: origin },
        body: JSON.stringify({ email, password, next: "/" }),
      });
      const setCookie =
        typeof res.headers.getSetCookie === "function"
          ? res.headers.getSetCookie()
          : [];
      const raw =
        setCookie.find((c) => c.startsWith("hk_session=")) ||
        res.headers.get("set-cookie") ||
        "";
      const m = /hk_session=([^;]+)/.exec(raw);
      const data = await res.json();
      return { status: res.status, data, cookie: m ? m[1] : "" };
    }
    const a = await apiLogin(
      "admin@hisabkitab.app",
      process.env.SEED_ADMIN_PASSWORD
    );
    ok(
      "api admin login",
      a.status === 200 && a.data.ok === true && !!a.cookie,
      JSON.stringify(a.data)
    );
    const u = await apiLogin("Naiz@gamil.com", process.env.SEED_USER_PASSWORD);
    ok(
      "api user login",
      u.status === 200 && u.data.ok === true && !!u.cookie,
      JSON.stringify(u.data)
    );
    const bad = await apiLogin("admin@hisabkitab.app", "wrong-password-xxxx");
    ok("api bad login 401", bad.status === 401 && bad.data.ok === false);
  }

  const failed = results.filter((r) => !r.pass);
  console.log("\n=== SUMMARY ===");
  console.log(`passed=${results.length - failed.length} failed=${failed.length}`);
  if (failed.length) {
    for (const f of failed) console.log(" -", f.name, f.detail);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function dbPath() {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "prisma", "dev.db");
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.subarray(0, 15).toString("utf8") !== "SQLite format 3") {
    return NextResponse.json({ error: "Not a valid SQLite database" }, { status: 400 });
  }
  const target = dbPath();
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target)) {
    fs.copyFileSync(target, `${target}.bak-${Date.now()}`);
  }
  fs.writeFileSync(target, buf);
  return NextResponse.json({ ok: true });
}

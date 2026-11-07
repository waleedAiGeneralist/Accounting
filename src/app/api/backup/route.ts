import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function dbPath() {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "prisma", "dev.db");
}

export async function GET() {
  const file = dbPath();
  if (!fs.existsSync(file)) {
    return NextResponse.json({ error: "Database not found" }, { status: 404 });
  }
  const buf = fs.readFileSync(file);
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="hisab-kitab-${stamp}.db"`,
    },
  });
}

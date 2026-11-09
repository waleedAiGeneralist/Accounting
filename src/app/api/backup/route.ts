import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isSameOrigin } from "@/lib/same-origin";

/** Admin-only ledger export. POST avoids cross-site top-level GET cookie CSRF. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  }

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [accounts, parties, stockItems, vouchers] = await Promise.all([
    prisma.account.findMany({ orderBy: { code: "asc" } }),
    prisma.party.findMany({ orderBy: { name: "asc" } }),
    prisma.stockItem.findMany({ orderBy: { name: "asc" } }),
    prisma.voucher.findMany({
      include: { lines: true, stockMoves: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    accounts,
    parties,
    stockItems,
    vouchers,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="hisab-kitab-backup.json"`,
    },
  });
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST /api/backup (admin session required)" },
    { status: 405 }
  );
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/** Export all ledger data as JSON — admin only. */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [accounts, parties, stockItems, vouchers] = await Promise.all([
    prisma.account.findMany(),
    prisma.party.findMany(),
    prisma.stockItem.findMany(),
    prisma.voucher.findMany({
      include: { lines: true, stockMoves: true },
      orderBy: { createdAt: "asc" },
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

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="hisab-kitab-${stamp}.json"`,
    },
  });
}

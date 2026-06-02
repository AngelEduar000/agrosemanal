import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCron } from "@/lib/cron-auth";
import { getWeekKey, getWeekStart } from "@/lib/dates";
import { sendWeeklySummary } from "@/lib/email";

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const email = process.env.AUTHORIZED_EMAIL;
  if (!email) {
    return NextResponse.json({ error: "AUTHORIZED_EMAIL no configurado" }, { status: 500 });
  }

  const weekStart = getWeekStart(new Date());
  const week = getWeekKey(new Date());

  const orders = await prisma.order.findMany({
    where: { week },
    orderBy: { date: "asc" },
  });

  const result = await sendWeeklySummary(email, orders, weekStart);

  return NextResponse.json({
    ok: result.ok,
    orders: orders.length,
    skipped: "skipped" in result ? result.skipped : false,
  });
}

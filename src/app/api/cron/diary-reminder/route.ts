import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCron } from "@/lib/cron-auth";
import { formatDateISO, startOfDay } from "@/lib/dates";
import { sendDiaryReminder } from "@/lib/email";

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const email = process.env.AUTHORIZED_EMAIL;
  if (!email) {
    return NextResponse.json({ error: "AUTHORIZED_EMAIL no configurado" }, { status: 500 });
  }

  const today = startOfDay(new Date());
  const existing = await prisma.diaryEntry.findUnique({ where: { date: today } });

  if (existing) {
    return NextResponse.json({ ok: true, sent: false, reason: "bitácora ya completada" });
  }

  const result = await sendDiaryReminder(email);

  return NextResponse.json({
    ok: result.ok,
    sent: true,
    date: formatDateISO(today),
    skipped: "skipped" in result ? result.skipped : false,
  });
}

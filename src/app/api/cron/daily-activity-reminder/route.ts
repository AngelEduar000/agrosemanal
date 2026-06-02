import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCron } from "@/lib/cron-auth";
import { startOfDay } from "@/lib/dates";
import { sendDailyActivityReminder } from "@/lib/email";

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { email: { not: "" } },
  });

  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayOrders = await prisma.order.findMany({
    where: { plannedDay: today },
    orderBy: { date: "asc" },
  });
  const tomorrowOrders = await prisma.order.findMany({
    where: { plannedDay: tomorrow },
    orderBy: { date: "asc" },
  });
  const todayTasks = await prisma.fieldTask.findMany({
    where: { date: today },
    orderBy: { date: "asc" },
  });
  const tomorrowTasks = await prisma.fieldTask.findMany({
    where: { date: tomorrow },
    orderBy: { date: "asc" },
  });

  const recipients = users.filter((user) => user.email).map((user) => user.email as string);
  if (!recipients.length) {
    return NextResponse.json({ ok: true, sent: false, reason: "no_users" });
  }

  const results = await Promise.all(
    recipients.map((to) =>
      sendDailyActivityReminder(to, todayOrders, tomorrowOrders, todayTasks, tomorrowTasks)
    )
  );

  return NextResponse.json({
    ok: results.every((result) => result.ok),
    sent: results.some((result) => result.ok),
    today: { orders: todayOrders.length, tasks: todayTasks.length },
    tomorrow: { orders: tomorrowOrders.length, tasks: tomorrowTasks.length },
  });
}

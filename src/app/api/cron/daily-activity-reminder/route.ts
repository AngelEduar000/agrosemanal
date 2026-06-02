import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCron } from "@/lib/cron-auth";
import { startOfDay, formatDateISO } from "@/lib/dates";
import { sendDailyActivityReminder, sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { email: { not: "" } },
  });

  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Calculate 30 minutes from now
  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
  const thirtyMinutesFromNowISO = formatDateISO(thirtyMinutesFromNow);
  const nowISO = formatDateISO(now);

  // Find tasks scheduled for today with specific times that are 30 minutes from now
  const upcomingTasks = await prisma.fieldTask.findMany({
    where: {
      date: today,
      scheduledTime: {
        not: null,
      },
      completed: false,
    },
  });

  // Filter tasks that are exactly 30 minutes away (within a 15-minute window)
  const tasksToNotify = upcomingTasks.filter((task) => {
    if (!task.scheduledTime) return false;
    
    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const taskDateTime = new Date(today);
    taskDateTime.setHours(hours, minutes, 0, 0);
    
    const timeDiff = taskDateTime.getTime() - now.getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    
    // Notify if task is within 25-35 minutes from now (to account for cron running every 15 min)
    return timeDiff >= 25 * 60 * 1000 && timeDiff <= 35 * 60 * 1000;
  });

  // Send individual notifications for upcoming tasks
  const taskNotificationResults = [];
  for (const task of tasksToNotify) {
    const recipients = users.filter((user) => user.email).map((user) => user.email as string);
    
    for (const to of recipients) {
      const html = `
        <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#283522">
          <h1 style="font-size:22px;color:#476339">Recordatorio de labor</h1>
          <p style="font-size:18px;line-height:1.6">
            Tienes una labor programada en 30 minutos:
          </p>
          <div style="background:#f0f5ed;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #e0e8dc">
            <p style="font-size:20px;font-weight:bold;color:#476339;margin:0">${task.title}</p>
            ${task.notes ? `<p style="font-size:16px;color:#55685d;margin:10px 0 0">${task.notes}</p>` : ''}
            <p style="font-size:16px;color:#55685d;margin:10px 0 0">⏰ ${task.scheduledTime}</p>
          </div>
          <p style="font-size:14px;color:#666;margin-top:24px">AgroSemanal — gestión profesional de tu calendario agrícola.</p>
        </div>
      `;
      
      const result = await sendEmail({
        to,
        subject: `Recordatorio: ${task.title} en 30 minutos`,
        html,
      });
      
      taskNotificationResults.push(result);
    }
  }

  // Also send the daily summary (original behavior)
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
    taskNotifications: taskNotificationResults.length,
    today: { orders: todayOrders.length, tasks: todayTasks.length },
    tomorrow: { orders: tomorrowOrders.length, tasks: tomorrowTasks.length },
  });
}

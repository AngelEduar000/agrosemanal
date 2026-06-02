import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { WeeklyPlanner } from "@/components/planner/WeeklyPlanner";
import { getDiaryEntry } from "@/actions/diary";
import {
  formatDateISO,
  getWeekKey,
  getWeekStartForKey,
  getWeekEnd,
} from "@/lib/dates";

export default async function PlanificadorPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  await auth();
  const params = await searchParams;
  const weekKey = params.week ?? getWeekKey(new Date());
  const weekStartDate = getWeekStartForKey(weekKey);
  const end = getWeekEnd(weekStartDate);
  const todayISO = formatDateISO(new Date());

  const [orders, tasks, todayDiary] = await Promise.all([
    prisma.order.findMany({
      where: { week: weekKey },
      orderBy: { priority: "asc" },
    }),
    prisma.fieldTask.findMany({
      where: { date: { gte: weekStartDate, lte: end } },
      orderBy: { date: "asc" },
    }),
    getDiaryEntry(todayISO),
  ]);

  const unassigned = orders.filter((o) => !o.plannedDay);

  return (
    <div className="space-y-4">
      <WeeklyPlanner
        weekKey={weekKey}
        weekStartIso={formatDateISO(weekStartDate)}
        orders={orders}
        tasks={tasks}
        diaryEntry={todayDiary}
        unassignedOrders={unassigned}
      />
    </div>
  );
}

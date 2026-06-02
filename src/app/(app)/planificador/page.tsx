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

  const orders = await prisma.order.findMany({
    where: { week: weekKey },
    orderBy: { priority: "asc" },
  });

  const tasks = await prisma.fieldTask.findMany({
    where: { date: { gte: weekStartDate, lte: end } },
    orderBy: { date: "asc" },
  });

  const unassigned = orders.filter((o) => !o.plannedDay);
  const todayDiary = await getDiaryEntry(formatDateISO(new Date()));

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.32em] text-agro-700">Agenda profesional</p>
        <h1 className="mt-3 font-display text-5xl font-bold text-agro-900">Calendario de actividades</h1>
        <p className="mt-4 max-w-3xl text-xl leading-relaxed text-stone-700">
          Visualiza tu semana con claridad y organiza tus bitácoras desde una vista moderna y profesional.
        </p>
      </header>

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

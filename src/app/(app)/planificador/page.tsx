import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { WeeklyPlanner } from "@/components/planner/WeeklyPlanner";
import {
  formatDateISO,
  formatWeekRange,
  getWeekEnd,
  getWeekKey,
  getWeekStartForKey,
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

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl font-bold text-agro-900">
          Planificador semanal
        </h1>
        <p className="mt-2 text-xl text-stone-700">
          Semana del {formatWeekRange(weekStartDate)}. Organice entregas y labores día a día.
        </p>
      </header>

      <WeeklyPlanner
        weekStartIso={formatDateISO(weekStartDate)}
        orders={orders}
        tasks={tasks}
        unassignedOrders={unassigned}
      />
    </div>
  );
}

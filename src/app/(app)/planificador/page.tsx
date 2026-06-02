import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityCalendar } from "@/components/planner/ActivityCalendar";
import {
  formatDateISO,
  getWeekKey,
  getWeekStartForKey,
  getTodayUTC,
} from "@/lib/dates";

export default async function PlanificadorPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  await auth();
  const params = await searchParams;
  const weekKey = params.week ?? getWeekKey(getTodayUTC());
  const weekStartDate = getWeekStartForKey(weekKey);
  
  // Calculate a wide date range to cover the entire monthly grid (6 weeks grid)
  const startRange = new Date(weekStartDate.getTime() - 10 * 86400000); // 10 days before
  const endRange = new Date(weekStartDate.getTime() + 45 * 86400000); // 45 days after

  const [tasks, diaryEntries] = await Promise.all([
    prisma.fieldTask.findMany({
      where: { date: { gte: startRange, lte: endRange } },
      orderBy: { date: "asc" },
    }),
    prisma.diaryEntry.findMany({
      where: { date: { gte: startRange, lte: endRange } },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      <ActivityCalendar
        weekKey={weekKey}
        weekStartIso={formatDateISO(weekStartDate)}
        tasks={tasks}
        diaryEntries={diaryEntries}
      />
    </div>
  );
}

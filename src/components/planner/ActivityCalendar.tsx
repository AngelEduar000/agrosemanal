"use client";

import { useMemo, useState, useCallback } from "react";
import type { FieldTask, DiaryEntry, Priority } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  formatDateISO,
  formatDateShort,
  getWeekDays,
  parseDateISO,
  getTodayUTC,
  getWeekKey,
} from "@/lib/dates";
import { ActivityEditor } from "@/components/activities/ActivityEditor";
import { toggleFieldTaskCompleted } from "@/actions/fieldTasks";

const DAY_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
type ViewMode = "week" | "month" | "day";

export function ActivityCalendar({
  weekKey,
  weekStartIso,
  tasks,
  diaryEntries,
  monthParam, // ← NUEVO PROP: "YYYY-MM" opcional, eg "2026-06"
}: {
  weekKey: string;
  weekStartIso: string;
  tasks: FieldTask[];
  diaryEntries: DiaryEntry[];
  monthParam?: string; // ← NUEVO
}) {
  const router = useRouter();
  const weekStart = parseDateISO(weekStartIso);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<string>(formatDateISO(getTodayUTC()));

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FieldTask | null>(null);

  // ✅ FIX: Derivar el mes/año a mostrar desde monthParam (si existe) o weekStart en UTC
  const { currentYear, currentMonth } = useMemo(() => {
    if (monthParam) {
      const [y, m] = monthParam.split("-").map(Number);
      return { currentYear: y, currentMonth: m }; // m es 1-based
    }
    // Fallback: usar UTC para evitar desfase de zona horaria
    return {
      currentYear: weekStart.getUTCFullYear(),
      currentMonth: weekStart.getUTCMonth() + 1, // 1-based
    };
  }, [monthParam, weekStart]);

  const navigateWeek = (direction: number) => {
    const offset = direction * 7 * 86400000;
    const targetDate = new Date(weekStart.getTime() + offset);
    const newWeekKey = getWeekKey(targetDate);
    router.push(`/planificador?week=${newWeekKey}`);
  };

  // ✅ FIX: navigateMonth ahora navega por parámetro "month=YYYY-MM" explícito
  const navigateMonth = (direction: number) => {
    let year = currentYear;
    let month = currentMonth + direction; // 1-based

    if (month > 12) { month = 1; year++; }
    if (month < 1)  { month = 12; year--; }

    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    router.push(`/planificador?month=${monthStr}`);
  };

  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);

  // ✅ FIX: monthDays usa currentYear/currentMonth (ya correctos en UTC)
  const monthDays = useMemo(() => {
    const firstDay = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    const lastDay  = new Date(Date.UTC(currentYear, currentMonth, 0));
    const allDays: Date[] = [];

    let startOffset = firstDay.getUTCDay() - 1;
    if (startOffset < 0) startOffset = 6;

    for (let i = 0; i < startOffset; i++) {
      allDays.push(new Date(firstDay.getTime() - (startOffset - i) * 86400000));
    }
    for (let d = new Date(firstDay); d <= lastDay; d = new Date(d.getTime() + 86400000)) {
      allDays.push(new Date(d));
    }
    const remaining = 7 - (allDays.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        allDays.push(new Date(lastDay.getTime() + i * 86400000));
      }
    }
    return allDays;
  }, [currentYear, currentMonth]);

  const tasksForDay = useCallback((day: Date) => {
    const iso = formatDateISO(day);
    return tasks.filter((t) => formatDateISO(new Date(t.date)) === iso);
  }, [tasks]);

  const diaryForDay = useCallback((day: Date) => {
    const iso = formatDateISO(day);
    return diaryEntries.find((d) => formatDateISO(new Date(d.date)) === iso);
  }, [diaryEntries]);

  const todayCount = useMemo(() => {
    const today = getTodayUTC();
    return tasksForDay(today).filter(t => !t.completed).length;
  }, [tasksForDay]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(formatDateISO(day));
  };

  const openCreateModal = (dateStr: string) => {
    setEditingTask(null);
    setSelectedDate(dateStr);
    setIsEditorOpen(true);
  };

  const openEditModal = (task: FieldTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsEditorOpen(true);
  };

  const handleToggleComplete = async (task: FieldTask, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFieldTaskCompleted(task.id, !task.completed);
    router.refresh();
  };

  const exportUrl = `/api/export/tasks?range=${viewMode === "month" ? "month" : "week"}&week=${weekKey}`;

  const getPriorityBadgeClass = (p: Priority, completed: boolean) => {
    if (completed) return "bg-stone-100 text-stone-400 dark:bg-stone-800/40 dark:text-stone-500 line-through border-stone-200/50 dark:border-stone-800/50";
    switch (p) {
      case "ALTA":  return "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200/60 dark:border-red-900/30";
      case "MEDIA": return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/30";
      default:      return "bg-stone-50 text-stone-700 dark:bg-stone-800/30 dark:text-stone-300 border-stone-200/60 dark:border-stone-700/30";
    }
  };

  const getPriorityDot = (p: Priority) => {
    switch (p) {
      case "ALTA":  return "🔴";
      case "MEDIA": return "🔵";
      default:      return "⚪";
    }
  };

  // ✅ FIX: título del mes usa currentYear/currentMonth (UTC-safe)
  const monthTitle = new Date(Date.UTC(currentYear, currentMonth - 1, 1))
    .toLocaleDateString("es-ES", { month: "long", timeZone: "UTC" });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="rounded-[28px] border border-white/60 bg-white/70 p-5 shadow-[0_15px_50px_rgba(45,61,40,0.03)] backdrop-blur-xl dark:border-white/10 dark:bg-stone-900/80 dark:shadow-stone-950/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-agro-700 dark:text-agro-400">Planificador Unificado</span>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <h1 className="text-2xl font-display font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
                <span>🗓️</span>
                <span>
                  {viewMode === "week"
                    ? `Semana ${weekKey}`
                    : viewMode === "month"
                      ? `${monthTitle} ${currentYear}`
                      : "Planificador de Hoy"}
                </span>
              </h1>

              <div className="flex items-center gap-1 bg-stone-100/80 dark:bg-stone-950/60 rounded-xl p-1 border border-stone-200/50 dark:border-stone-800 shadow-sm">
                <button
                  type="button"
                  onClick={() => viewMode === "month" ? navigateMonth(-1) : navigateWeek(-1)}
                  className="p-1 px-2.5 rounded-lg text-xs font-bold hover:bg-white dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
                >◀</button>
                <button
                  type="button"
                  onClick={() => router.push(`/planificador`)}
                  className="p-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
                >Hoy</button>
                <button
                  type="button"
                  onClick={() => viewMode === "month" ? navigateMonth(1) : navigateWeek(1)}
                  className="p-1 px-2.5 rounded-lg text-xs font-bold hover:bg-white dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
                >▶</button>
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
              {viewMode === "week"
                ? `${formatDateShort(weekStart)} — ${formatDateShort(new Date(weekStart.getTime() + 6 * 86400000))}`
                : viewMode === "month"
                  ? "Cuadrícula interactiva de labores agrícolas y bitácoras"
                  : `${formatDateShort(new Date())}`}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:justify-end">
            <div className="flex gap-1 rounded-xl border border-stone-200/60 bg-stone-50/80 p-1 dark:border-stone-800 dark:bg-stone-950/60">
              {(["week", "month", "day"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    viewMode === mode
                      ? "bg-agro-700 text-white shadow-sm dark:bg-agro-600"
                      : "text-stone-600 dark:text-stone-400 hover:bg-white dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white"
                  }`}
                >
                  {mode === "week" ? "Semana" : mode === "month" ? "Mes" : "Hoy"}
                </button>
              ))}
            </div>

            <Link
              href={exportUrl}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-agro-700 border border-agro-800 dark:bg-agro-600 dark:border-agro-700 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-agro-800 dark:hover:bg-agro-700 transition"
            >
              📥 Excel Completo
            </Link>

            <button
              onClick={() => openCreateModal(selectedDate)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-emerald-600 border border-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition cursor-pointer"
            >
              ➕ Nueva Labor
            </button>
          </div>
        </div>

        {todayCount > 0 && (
          <div className="rounded-2xl border-l-4 border-agro-600 bg-agro-50/50 dark:bg-agro-950/10 p-3.5 mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🌾</span>
              <p className="text-xs font-bold text-agro-900 dark:text-agro-400">
                ¡Tienes {todayCount} labor{todayCount > 1 ? "es" : ""} pendiente{todayCount > 1 ? "s" : ""} por completar hoy!
              </p>
            </div>
            <button
              onClick={() => { setViewMode("day"); setSelectedDate(formatDateISO(getTodayUTC())); }}
              className="text-xs font-bold text-agro-700 dark:text-agro-400 hover:underline transition"
            >
              Ver mis labores de hoy
            </button>
          </div>
        )}
      </div>

      {/* Vista Mensual */}
      {viewMode === "month" && (
        <div className="rounded-[28px] border border-white/60 bg-white/70 p-5 shadow-[0_15px_50px_rgba(45,61,40,0.03)] backdrop-blur-xl dark:border-white/10 dark:bg-stone-900/80">
          <div className="grid grid-cols-7 gap-2.5">
            {DAY_SHORT.map((day) => (
              <div key={day} className="p-2 text-center">
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{day}</p>
              </div>
            ))}

            {monthDays.map((day) => {
              const dayTasks = tasksForDay(day);
              const diary    = diaryForDay(day);
              // ✅ FIX: comparar con currentMonth (1-based, UTC)
              const isCurrentMonth = day.getUTCMonth() + 1 === currentMonth && day.getUTCFullYear() === currentYear;
              const iso      = formatDateISO(day);
              const isToday  = formatDateISO(getTodayUTC()) === iso;
              const isSelected = selectedDate === iso;

              return (
                <div
                  key={iso}
                  onClick={() => handleDayClick(day)}
                  className={[
                    "relative min-h-[120px] p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between select-none group",
                    isSelected
                      ? "border-agro-500 bg-agro-50/60 dark:bg-agro-950/20 shadow-[0_8px_30px_rgba(71,99,57,0.08)] ring-2 ring-agro-600/30 scale-[1.02] z-10"
                      : isToday
                        ? "border-agro-200 bg-agro-50/20 dark:border-agro-900/40 dark:bg-agro-950/10"
                        : !isCurrentMonth
                          ? "border-stone-100 dark:border-stone-800/40 bg-stone-50/20 opacity-30 hover:opacity-60 dark:bg-stone-950/10"
                          : "border-stone-100 dark:border-stone-800/50 bg-white dark:bg-stone-850 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 hover:scale-[1.01]"
                  ].join(" ")}
                >
                  <div>
                    <div className="mb-2 flex justify-between items-center border-b border-stone-100/50 dark:border-stone-800/50 pb-1">
                      <p className={`text-xs font-bold ${
                        isSelected ? "text-agro-800 dark:text-agro-400"
                        : !isCurrentMonth ? "text-stone-400 dark:text-stone-600"
                        : "text-stone-700 dark:text-stone-300"
                      }`}>
                        {day.getUTCDate()}
                      </p>
                      <div className="flex gap-1 items-center">
                        {diary && (
                          <Link
                            href={`/bitacora?fecha=${iso}`}
                            title="Ver Bitácora Diaria"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs hover:scale-125 transition"
                          >📖</Link>
                        )}
                        {isSelected && (
                          <span className="flex h-1.5 w-1.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agro-400 opacity-75 animate-duration-1000"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-agro-600"></span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          onClick={(e) => openEditModal(task, e)}
                          className={[
                            "text-[10px] font-semibold rounded-lg px-2 py-0.5 border transition truncate flex items-center justify-between",
                            getPriorityBadgeClass(task.priority, task.completed)
                          ].join(" ")}
                          title={`${task.title} ${task.scheduledTime ? `(${task.scheduledTime})` : ""}`}
                        >
                          <span className="truncate flex items-center gap-1">
                            <span>{getPriorityDot(task.priority)}</span>
                            <span className="truncate">
                              {task.scheduledTime && <span className="font-bold mr-1">{task.scheduledTime}</span>}
                              {task.title}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleToggleComplete(task, e)}
                            className="ml-1 opacity-0 group-hover:opacity-100 text-[10px] hover:scale-125 transition cursor-pointer"
                            title={task.completed ? "Marcar pendiente" : "Marcar completado"}
                          >
                            {task.completed ? "↩️" : "✓"}
                          </button>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <p className="text-[8.5px] font-bold text-stone-500 pl-1">+{dayTasks.length - 3} más</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] mt-1 pt-1.5 border-t border-stone-500/5 opacity-0 group-hover:opacity-100 transition duration-200">
                    <span
                      onClick={(e) => { e.stopPropagation(); openCreateModal(iso); }}
                      className="text-agro-700 dark:text-agro-400 font-bold hover:underline"
                    >
                      + Añadir labor
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista Semanal */}
      {viewMode === "week" && (
        <div className="rounded-[28px] border border-white/60 bg-white/70 p-5 shadow-[0_15px_50px_rgba(45,61,40,0.03)] backdrop-blur-xl dark:border-white/10 dark:bg-stone-900/80">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {days.map((day, i) => {
              const dayTasks  = tasksForDay(day);
              const diary     = diaryForDay(day);
              const iso       = formatDateISO(day);
              const isToday   = formatDateISO(getTodayUTC()) === iso;
              const isSelected = selectedDate === iso;

              return (
                <div
                  key={iso}
                  onClick={() => handleDayClick(day)}
                  className={[
                    "relative min-h-[220px] p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group",
                    isSelected
                      ? "border-agro-500 bg-agro-50/60 dark:bg-agro-950/20 shadow-[0_8px_30px_rgba(71,99,57,0.08)] ring-2 ring-agro-600/30 scale-[1.02] z-10"
                      : isToday
                        ? "border-agro-200 bg-agro-50/20 dark:border-agro-900/40 dark:bg-agro-950/10"
                        : "border-stone-100 dark:border-stone-800/50 bg-white dark:bg-stone-850 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 hover:scale-[1.01]"
                  ].join(" ")}
                >
                  <div>
                    <div className="mb-3 border-b border-stone-100 dark:border-stone-800 pb-1.5 flex justify-between items-start">
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? "text-agro-800 dark:text-agro-400" : "text-stone-800 dark:text-stone-200"}`}>{DAY_SHORT[i]}</p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">{formatDateShort(day)}</p>
                      </div>
                      <div className="flex gap-1 items-center">
                        {diary && (
                          <Link href={`/bitacora?fecha=${iso}`} onClick={(e) => e.stopPropagation()} className="text-xs hover:scale-125 transition" title="Ver Bitácora Diaria">📖</Link>
                        )}
                        {isSelected && (
                          <span className="flex h-1.5 w-1.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agro-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-agro-600"></span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={(e) => openEditModal(task, e)}
                          className={[
                            "text-[10px] font-semibold rounded-lg px-2.5 py-1 border transition flex items-center justify-between cursor-pointer",
                            getPriorityBadgeClass(task.priority, task.completed)
                          ].join(" ")}
                        >
                          <span className="truncate flex items-center gap-1.5">
                            <span>{getPriorityDot(task.priority)}</span>
                            <span className="truncate">
                              {task.scheduledTime && <span className="font-bold mr-1">{task.scheduledTime}</span>}
                              {task.title}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleToggleComplete(task, e)}
                            className="ml-1 opacity-50 hover:opacity-100 text-[10px] hover:scale-125 transition cursor-pointer"
                          >
                            {task.completed ? "↩️" : "✓"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-500/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition duration-200">
                    <span
                      onClick={(e) => { e.stopPropagation(); openCreateModal(iso); }}
                      className="text-[10px] text-agro-700 dark:text-agro-400 font-bold hover:underline"
                    >
                      + Añadir labor
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista de Hoy */}
      {viewMode === "day" && (
        <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_15px_50px_rgba(45,61,40,0.03)] backdrop-blur-xl dark:border-white/10 dark:bg-stone-900/80 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 pb-3">
            <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <span>🌾</span> Agenda de Labores del Día ({formatDateShort(getTodayUTC())})
            </h2>
            {diaryForDay(getTodayUTC()) && (
              <Link
                href={`/bitacora?fecha=${formatDateISO(getTodayUTC())}`}
                className="text-xs font-bold text-agro-700 dark:text-agro-400 bg-agro-50 dark:bg-agro-950/10 px-3 py-1.5 rounded-lg border border-agro-100/50 hover:bg-agro-100 transition flex items-center gap-1.5"
              >
                📖 Ver Bitácora de Hoy
              </Link>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-white mb-3">Pendientes y completados</p>
            {tasksForDay(getTodayUTC()).length === 0 ? (
              <p className="text-xs text-stone-500 bg-stone-50/50 dark:bg-stone-950/20 border border-stone-250/50 dark:border-stone-800 p-5 rounded-2xl">
                No tienes labores asignadas para hoy. ¡Aprovecha a descansar o planifica una labor haciendo clic arriba!
              </p>
            ) : (
              <div className="space-y-2">
                {tasksForDay(getTodayUTC()).map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => openEditModal(task, e)}
                    className={[
                      "text-xs rounded-xl border px-4 py-3 text-stone-850 dark:text-stone-200 flex items-center justify-between cursor-pointer transition hover:scale-[1.005]",
                      getPriorityBadgeClass(task.priority, task.completed)
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{getPriorityDot(task.priority)}</span>
                      <div>
                        <p className={`font-semibold ${task.completed ? "line-through opacity-50" : ""}`}>{task.title}</p>
                        {task.notes && <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">{task.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {task.scheduledTime && (
                        <span className="text-[10px] font-bold bg-stone-200/50 dark:bg-stone-800 px-2 py-1 rounded-lg">
                          ⏰ {task.scheduledTime}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleToggleComplete(task, e)}
                        className="p-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 transition cursor-pointer text-xs"
                      >
                        {task.completed ? "↩️ Pendiente" : "✓ Completar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ActivityEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        task={editingTask}
        defaultDate={selectedDate}
      />
    </div>
  );
}
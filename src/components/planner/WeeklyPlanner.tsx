"use client";

import type { FieldTask, Order } from "@prisma/client";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatDateISO,
  formatDateShort,
  getWeekDays,
  parseDateISO,
} from "@/lib/dates";
import { createFieldTask } from "@/actions/fieldTasks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const DAY_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

type ViewMode = "week" | "month" | "day";

export function WeeklyPlanner({
  weekKey,
  weekStartIso,
  orders,
  tasks,
  unassignedOrders,
}: {
  weekKey: string;
  weekStartIso: string;
  orders: Order[];
  tasks: FieldTask[];
  diaryEntry: { content: string } | null;
  unassignedOrders: Order[];
}) {
  const router = useRouter();
  const weekStart = parseDateISO(weekStartIso);
  const [message, setMessage] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState<string>(formatDateISO(new Date()));

  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const monthDays = useMemo(() => {
    const now = weekStart;
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const allDays: Date[] = [];
    
    // Find the first Monday before or on the 1st of the month
    let startOffset = firstDay.getDay() - 1; // Mon=0, Tue=1 ... Sun=6
    if (startOffset < 0) startOffset = 6; // Sunday is 6th offset
    
    for (let i = 0; i < startOffset; i++) {
      allDays.push(new Date(firstDay.getTime() - (startOffset - i) * 86400000));
    }
    for (let d = firstDay; d <= lastDay; d = new Date(d.getTime() + 86400000)) {
      allDays.push(new Date(d));
    }
    return allDays;
  }, [weekStart]);

  const ordersForDay = useCallback((day: Date) => {
    const iso = formatDateISO(day);
    return orders.filter(
      (o) => o.plannedDay && formatDateISO(new Date(o.plannedDay)) === iso
    );
  }, [orders]);

  const tasksForDay = useCallback((day: Date) => {
    const iso = formatDateISO(day);
    return tasks.filter((t) => formatDateISO(new Date(t.date)) === iso);
  }, [tasks]);

  const todayCount = useMemo(() => {
    const today = new Date();
    return ordersForDay(today).length + tasksForDay(today).length;
  }, [ordersForDay, tasksForDay]);

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const formData = new FormData(e.currentTarget);
    const target = e.currentTarget;
    const res = await createFieldTask(formData);
    if (res.ok) {
      setMessage("✓ Nota añadida");
      target.reset();
      router.refresh();
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage(res.error ?? "Error");
    }
  }

  const currentMonth = weekStart.getMonth() + 1;
  const currentYear = weekStart.getFullYear();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header y controles */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_15px_50px_rgba(45,61,40,0.03)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-xl font-display font-bold text-agro-900 flex items-center gap-2">
              <span>📅</span>
              <span>
                {viewMode === "week"
                  ? `Semana ${weekKey}`
                  : viewMode === "month"
                    ? `${new Date(currentYear, currentMonth - 1, 1).toLocaleDateString("es-ES", { month: "long" })} ${currentYear}`
                    : "Planificador de Hoy"}
              </span>
            </h1>
            <p className="text-xs text-stone-500 mt-1 font-medium">
              {viewMode === "week"
                ? `${formatDateShort(weekStart)} — ${formatDateShort(new Date(weekStart.getTime() + 6 * 86400000))}`
                : viewMode === "month"
                  ? "Organización y labores del mes agrícola"
                  : `${formatDateShort(new Date())}`}
            </p>
          </div>

          {/* Selector de vista y exportar */}
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="flex gap-1 rounded-xl border border-stone-200/60 bg-stone-50/80 p-1">
              {(["week", "month", "day"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    viewMode === mode
                      ? "bg-agro-700 text-white shadow-sm"
                      : "text-stone-600 hover:bg-white hover:text-stone-900"
                  }`}
                >
                  {mode === "week" ? "Semana" : mode === "month" ? "Mes" : "Hoy"}
                </button>
              ))}
            </div>

            <Link
              href={`/api/export/orders?range=${viewMode === "month" ? "month" : viewMode === "day" ? "day" : "week"}&week=${weekKey}`}
              className="whitespace-nowrap rounded-xl bg-agro-700 border border-agro-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-agro-800 transition duration-200"
            >
              📥 Descargar Reporte
            </Link>
          </div>
        </div>

        {/* Alerta de hoy */}
        {todayCount > 0 && (
          <div className="rounded-2xl border-l-4 border-agro-600 bg-agro-50/50 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🌾</span>
              <p className="text-xs font-bold text-agro-900">
                ¡Tienes {todayCount} labor{todayCount > 1 ? "es" : ""} programada{todayCount > 1 ? "s" : ""} para hoy!
              </p>
            </div>
            <button
              onClick={() => {
                setViewMode("day");
                setSelectedDate(formatDateISO(new Date()));
              }}
              className="text-xs font-bold text-agro-700 hover:text-agro-900 transition underline underline-offset-2"
            >
              Ver agenda de hoy
            </button>
          </div>
        )}
      </div>

      {/* Vista semanal */}
      {viewMode === "week" && (
        <div className="rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_15px_50px_rgba(45,61,40,0.04)] backdrop-blur-xl">
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {days.map((day, i) => {
              const dayTasks = tasksForDay(day);
              const dayOrders = ordersForDay(day);
              const isToday = new Date().toDateString() === new Date(day).toDateString();
              const isSelected = selectedDate === formatDateISO(day);

              return (
                <div
                  key={formatDateISO(day)}
                  onClick={() => setSelectedDate(formatDateISO(day))}
                  className={[
                    "relative min-h-[160px] p-4 rounded-2xl transition-all duration-300 cursor-pointer border flex flex-col justify-between select-none",
                    isSelected
                      ? "border-agro-500 bg-agro-50/80 shadow-[0_8px_30px_rgba(71,99,57,0.1)] ring-2 ring-agro-600/30 scale-[1.03] z-10"
                      : isToday
                        ? "border-agro-200 bg-agro-50/30"
                        : "border-stone-100 bg-white/80 hover:bg-stone-50/50 hover:scale-[1.01] hover:shadow-md"
                  ].join(" ")}
                >
                  <div>
                    <div className="mb-2 border-b border-stone-100/80 pb-1.5 flex justify-between items-start">
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? "text-agro-800" : "text-stone-800"}`}>{DAY_SHORT[i]}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5">{formatDateShort(day)}</p>
                      </div>
                      {isSelected && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agro-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-agro-600"></span>
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className="text-[10px] font-medium rounded px-1.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 truncate hover:bg-blue-100 hover:text-blue-800 transition"
                          title={task.title}
                        >
                          📌 {task.title}
                        </div>
                      ))}
                      {dayOrders.map((order) => (
                        <div
                          key={order.id}
                          className="text-[10px] font-medium rounded px-1.5 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 truncate hover:bg-amber-100 hover:text-amber-800 transition"
                          title={`${order.clientName} - ${order.product}`}
                        >
                          📦 {order.clientName}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista mensual */}
      {viewMode === "month" && (
        <div className="rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_15px_50px_rgba(45,61,40,0.04)] backdrop-blur-xl">
          <div className="grid grid-cols-7 gap-2">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div key={day} className="p-2 text-center">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{day}</p>
              </div>
            ))}

            {monthDays.map((day) => {
              const dayTasks = tasksForDay(day);
              const dayOrders = ordersForDay(day);
              const isCurrentMonth = day.getMonth() === weekStart.getMonth();
              const isToday = new Date().toDateString() === day.toDateString();
              const isSelected = selectedDate === formatDateISO(day);
              const count = dayTasks.length + dayOrders.length;

              return (
                <div
                  key={formatDateISO(day)}
                  onClick={() => setSelectedDate(formatDateISO(day))}
                  className={[
                    "relative min-h-[100px] p-2.5 rounded-xl transition-all duration-300 cursor-pointer border flex flex-col justify-between select-none",
                    isSelected
                      ? "border-agro-500 bg-agro-50/80 shadow-[0_8px_20px_rgba(71,99,57,0.08)] ring-2 ring-agro-600/30 scale-[1.03] z-10"
                      : isToday
                        ? "border-agro-200 bg-agro-50/30"
                        : !isCurrentMonth
                          ? "border-stone-100 bg-stone-50/30 opacity-40 hover:opacity-75"
                          : "border-stone-100 bg-white hover:bg-stone-50/50 hover:scale-[1.01] hover:shadow"
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs font-bold ${
                        isSelected
                          ? "text-agro-800"
                          : !isCurrentMonth
                            ? "text-stone-400"
                            : "text-stone-700"
                      }`}
                    >
                      {day.getDate()}
                    </p>
                    {isSelected && (
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agro-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-agro-600"></span>
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5 text-[9px] mt-1.5 overflow-hidden">
                    {dayTasks.slice(0, 1).map((task) => (
                      <div
                        key={task.id}
                        className="rounded px-1 bg-blue-50/80 text-blue-600 border border-blue-100/50 truncate"
                        title={task.title}
                      >
                        📌 {task.title}
                      </div>
                    ))}
                    {dayOrders.slice(0, 1).map((order) => (
                      <div
                        key={order.id}
                        className="rounded px-1 bg-amber-50/80 text-amber-600 border border-amber-100/50 truncate"
                        title={order.clientName}
                      >
                        📦 {order.clientName}
                      </div>
                    ))}
                    {count > 2 && (
                      <p className="text-[8px] text-stone-500 font-semibold pl-1">+{count - 2} más</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista de hoy */}
      {viewMode === "day" && (
        <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_15px_50px_rgba(45,61,40,0.04)] backdrop-blur-xl space-y-5">
          <div>
            <p className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <span>📌</span> Tareas del día
            </p>
            {tasksForDay(new Date()).length === 0 ? (
              <p className="text-xs text-stone-500 bg-stone-50/50 border border-stone-200/50 rounded-xl p-4">Sin tareas asignadas para hoy</p>
            ) : (
              <div className="space-y-2">
                {tasksForDay(new Date()).map((task) => (
                  <div
                    key={task.id}
                    className="text-xs rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-blue-800 flex items-center gap-2 hover:bg-blue-50 transition"
                  >
                    <span>📌</span>
                    <span className="font-medium">{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-stone-100 pt-5">
            <p className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <span>📦</span> Pedidos programados
            </p>
            {ordersForDay(new Date()).length === 0 ? (
              <p className="text-xs text-stone-500 bg-stone-50/50 border border-stone-200/50 rounded-xl p-4">Sin pedidos programados para hoy</p>
            ) : (
              <div className="space-y-2">
                {ordersForDay(new Date()).map((order) => (
                  <div
                    key={order.id}
                    className="text-xs rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-amber-800 flex items-center gap-2 hover:bg-amber-50 transition"
                  >
                    <span>📦</span>
                    <span className="font-medium">{order.clientName} - {order.product}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pedidos sin asignar */}
      {unassignedOrders.length > 0 && (
        <div className="rounded-[28px] border border-amber-200/50 bg-amber-50/40 p-5 shadow-sm backdrop-blur-md">
          <p className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <span>⚠️</span>
            <span>{unassignedOrders.length} pedido{unassignedOrders.length > 1 ? "s" : ""} sin fecha asignada</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {unassignedOrders.slice(0, 6).map((order) => (
              <div key={order.id} className="text-xs bg-white/80 rounded-xl p-3.5 border border-amber-200/60 shadow-sm hover:shadow-md transition">
                <p className="font-semibold text-stone-800 truncate">👤 {order.clientName}</p>
                <p className="text-stone-600 mt-0.5 truncate">🌾 {order.product}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario para añadir notas */}
      <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_15px_50px_rgba(45,61,40,0.04)] backdrop-blur-xl">
        <h2 className="mb-4 text-sm font-semibold text-stone-900 flex items-center gap-2">
          <span>📝</span>
          <span>Añadir nota rápida</span>
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fecha"
              name="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <Input label="Título" name="title" placeholder="Ej: Revisar maíz" required />
          </div>
          <Textarea label="Detalles (opcional)" name="notes" placeholder="Observaciones..." />
          {message && (
            <p className="text-xs text-agro-700 font-semibold p-2 bg-agro-50 rounded-lg inline-block border border-agro-100">{message}</p>
          )}
          <div className="flex justify-end pt-2">
            <Button type="submit" className="px-6 min-h-[38px] rounded-xl font-semibold shadow-sm hover:shadow transition duration-200">
              Guardar nota
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

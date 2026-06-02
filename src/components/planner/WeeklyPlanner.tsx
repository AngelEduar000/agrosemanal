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

  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const monthDays = useMemo(() => {
    const now = weekStart;
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const allDays: Date[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      allDays.push(new Date(firstDay.getTime() - (firstDay.getDay() - i) * 86400000));
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

  async function addTask(formData: FormData) {
    setMessage("");
    const res = await createFieldTask(formData);
    if (res.ok) {
      setMessage("✓ Nota añadida");
      router.refresh();
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage(res.error ?? "Error");
    }
  }

  const currentMonth = weekStart.getMonth() + 1;
  const currentYear = weekStart.getFullYear();

  return (
    <div className="space-y-3 max-w-7xl mx-auto">
      {/* Header y controles */}
      <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-stone-900">
              {viewMode === "week"
                ? `Semana ${weekKey}`
                : viewMode === "month"
                  ? `${currentMonth}/${currentYear}`
                  : "Hoy"}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {viewMode === "week"
                ? `${formatDateShort(weekStart)} — ${formatDateShort(new Date(weekStart.getTime() + 6 * 86400000))}`
                : viewMode === "month"
                  ? `${new Date(currentYear, currentMonth - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`
                  : `${formatDateShort(new Date())}`}
            </p>
          </div>

          {/* Selector de vista y exportar */}
          <div className="flex gap-2 flex-wrap justify-end">
            <div className="flex gap-1 rounded-md border border-stone-200 bg-stone-50 p-1">
              {(["week", "month", "day"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2 py-1 rounded text-xs font-medium transition ${
                    viewMode === mode
                      ? "bg-agro-600 text-white"
                      : "text-stone-600 hover:bg-white"
                  }`}
                >
                  {mode === "week" ? "Sem" : mode === "month" ? "Mes" : "Hoy"}
                </button>
              ))}
            </div>

            <Link
              href={`/api/export/orders?range=${viewMode === "month" ? "month" : viewMode === "day" ? "day" : "week"}&week=${weekKey}`}
              className="whitespace-nowrap rounded-md bg-agro-700 px-2 py-1 text-xs font-semibold text-white hover:bg-agro-800 transition"
            >
              Descargar
            </Link>
          </div>
        </div>

        {/* Alerta de hoy */}
        {todayCount > 0 && (
          <div className="rounded border-l-4 border-agro-500 bg-agro-50 p-2">
            <p className="text-xs font-semibold text-agro-900">
              Hoy: {todayCount} tarea{todayCount > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Vista semanal */}
      {viewMode === "week" && (
        <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-stone-200">
            {days.map((day, i) => {
              const dayTasks = tasksForDay(day);
              const dayOrders = ordersForDay(day);
              const isToday = new Date().toDateString() === new Date(day).toDateString();

              return (
                <div
                  key={formatDateISO(day)}
                  className={`min-h-20 bg-white p-2 ${isToday ? "bg-agro-50" : ""} hover:bg-stone-50 transition`}
                >
                  <div className="mb-2 border-b border-stone-100 pb-1">
                    <p className="text-xs font-bold text-stone-800">{DAY_SHORT[i]}</p>
                    <p className="text-xs text-stone-500">{formatDateShort(day)}</p>
                  </div>
                  <div className="space-y-0.5">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="text-xs rounded px-1 py-0.5 bg-blue-100 text-blue-800 truncate hover:bg-blue-200"
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayOrders.map((order) => (
                      <div
                        key={order.id}
                        className="text-xs rounded px-1 py-0.5 bg-amber-100 text-amber-800 truncate"
                        title={`${order.clientName} - ${order.product}`}
                      >
                        {order.clientName}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista mensual */}
      {viewMode === "month" && (
        <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-stone-200">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div key={day} className="bg-white p-2 text-center border-b border-stone-200">
                <p className="text-xs font-semibold text-stone-600">{day}</p>
              </div>
            ))}

            {monthDays.map((day) => {
              const dayTasks = tasksForDay(day);
              const dayOrders = ordersForDay(day);
              const isCurrentMonth = day.getMonth() === weekStart.getMonth();
              const isToday = new Date().toDateString() === day.toDateString();
              const count = dayTasks.length + dayOrders.length;

              return (
                <div
                  key={formatDateISO(day)}
                  className={`min-h-16 bg-white p-1 border-b border-stone-200 ${
                    !isCurrentMonth ? "bg-stone-50" : ""
                  } ${isToday ? "bg-agro-50" : ""}`}
                >
                  <p
                    className={`text-xs font-semibold mb-1 ${
                      !isCurrentMonth ? "text-stone-400" : "text-stone-800"
                    }`}
                  >
                    {day.getDate()}
                  </p>
                  <div className="space-y-0.5 text-xs">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className="rounded px-0.5 py-0.5 bg-blue-100 text-blue-700 truncate"
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayOrders.slice(0, 2).map((order) => (
                      <div
                        key={order.id}
                        className="rounded px-0.5 py-0.5 bg-amber-100 text-amber-700 truncate"
                        title={order.clientName}
                      >
                        {order.clientName}
                      </div>
                    ))}
                    {count > 4 && (
                      <p className="text-xs text-stone-500">+{count - 4}</p>
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
        <div className="rounded-lg border border-stone-200 bg-white p-3 space-y-3">
          <div>
            <p className="text-sm font-semibold text-stone-900 mb-2">Tareas</p>
            {tasksForDay(new Date()).length === 0 ? (
              <p className="text-xs text-stone-500">Sin tareas</p>
            ) : (
              <div className="space-y-1">
                {tasksForDay(new Date()).map((task) => (
                  <div
                    key={task.id}
                    className="text-xs rounded-md px-2 py-1 bg-blue-100 text-blue-800"
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-stone-200 pt-3">
            <p className="text-sm font-semibold text-stone-900 mb-2">Pedidos</p>
            {ordersForDay(new Date()).length === 0 ? (
              <p className="text-xs text-stone-500">Sin pedidos</p>
            ) : (
              <div className="space-y-1">
                {ordersForDay(new Date()).map((order) => (
                  <div
                    key={order.id}
                    className="text-xs rounded-md px-2 py-1 bg-amber-100 text-amber-800"
                  >
                    {order.clientName} - {order.product}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pedidos sin asignar */}
      {unassignedOrders.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-900 mb-2">
            {unassignedOrders.length} pedido{unassignedOrders.length > 1 ? "s" : ""} sin asignar
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {unassignedOrders.slice(0, 6).map((order) => (
              <div key={order.id} className="text-xs bg-white rounded p-2 border border-amber-200">
                <p className="font-semibold truncate">{order.clientName}</p>
                <p className="text-stone-600 truncate">{order.product}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario para añadir notas */}
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <h2 className="mb-2 text-sm font-semibold text-stone-900">Añadir nota</h2>
        <form action={addTask} className="space-y-2">
          <Input
            label="Fecha"
            name="date"
            type="date"
            defaultValue={formatDateISO(new Date())}
          />
          <Input label="Título" name="title" placeholder="Ej: Revisar maíz" />
          <Textarea label="Detalles (opcional)" name="notes" placeholder="Observaciones..." />
          {message && (
            <p className="text-xs text-agro-700 font-semibold">{message}</p>
          )}
          <Button type="submit" fullWidth>
            Guardar
          </Button>
        </form>
      </div>
    </div>
  );
}

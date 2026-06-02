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
  formatDateLong,
} from "@/lib/dates";
import { PRIORITY_LABELS } from "@/lib/labels";
import { assignOrderToDay, updateOrderStatus } from "@/actions/orders";
import { createFieldTask, deleteFieldTask } from "@/actions/fieldTasks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const DAY_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function WeeklyPlanner({
  weekKey,
  weekStartIso,
  orders,
  tasks,
  diaryEntry,
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
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);

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

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 bg-white p-4">
        <div>
          <h1 className="text-lg font-bold text-stone-900">Semana {weekKey}</h1>
          <p className="text-xs text-stone-600">
            {formatDateShort(weekStart)} — {formatDateShort(new Date(weekStart.getTime() + 6 * 86400000))}
          </p>
        </div>
        <Link
          href={`/api/export/tasks?range=week&week=${weekKey}`}
          className="whitespace-nowrap rounded-md bg-agro-700 px-3 py-2 text-xs font-semibold text-white hover:bg-agro-800"
        >
          Descargar
        </Link>
      </div>

      {/* Alert de hoy */}
      {todayCount > 0 && (
        <div className="rounded-lg border-l-4 border-agro-500 bg-agro-50 p-3">
          <p className="text-sm font-semibold text-agro-900">
            Hoy tienes {todayCount} tarea{todayCount > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Calendario semanal - Grid compacto */}
      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-stone-200">
          {days.map((day, i) => {
            const dayTasks = tasksForDay(day);
            const dayOrders = ordersForDay(day);
            const isToday = new Date().toDateString() === new Date(day).toDateString();

            return (
              <div
                key={formatDateISO(day)}
                className={`min-h-24 bg-white p-2 ${
                  isToday ? "bg-agro-50" : ""
                } cursor-pointer hover:bg-stone-50 transition border-b border-stone-200`}
                onClick={() =>
                  setSelectedDay(
                    selectedDay === formatDateISO(day) ? null : formatDateISO(day)
                  )
                }
              >
                <div className="mb-2 border-b border-stone-100 pb-1">
                  <p className="text-xs font-bold text-stone-900">{DAY_SHORT[i]}</p>
                  <p className="text-xs text-stone-500">{formatDateShort(day)}</p>
                </div>
                <div className="space-y-0.5">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group relative rounded px-1 py-0.5 bg-blue-100 text-xs text-blue-900 truncate hover:bg-blue-200"
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded px-1 py-0.5 bg-amber-100 text-xs text-amber-900 truncate"
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

      {/* Detalles del día seleccionado */}
      {selectedDay && (
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-stone-900">
              {formatDateLong(new Date(selectedDay))}
            </p>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs font-semibold text-stone-500 hover:text-stone-700"
            >
              Cerrar
            </button>
          </div>

          <div className="space-y-3">
            {/* Tareas */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-stone-600">
                Notas ({tasksForDay(new Date(selectedDay)).length})
              </p>
              <div className="space-y-1">
                {tasksForDay(new Date(selectedDay)).map((task) => (
                  <div key={task.id} className="flex items-start gap-2 rounded bg-stone-50 p-2">
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-stone-900">{task.title}</p>
                      {task.notes && (
                        <p className="mt-1 text-stone-600">{task.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        deleteFieldTask(task.id).then(() => {
                          router.refresh();
                          setSelectedDay(null);
                        });
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pedidos */}
            {ordersForDay(new Date(selectedDay)).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-stone-600">
                  Pedidos ({ordersForDay(new Date(selectedDay)).length})
                </p>
                <div className="space-y-1">
                  {ordersForDay(new Date(selectedDay)).map((order) => (
                    <div key={order.id} className="rounded bg-stone-50 p-2 text-xs">
                      <p className="font-semibold text-stone-900">{order.clientName}</p>
                      <p className="mt-1 text-stone-600">{order.product}</p>
                      <select
                        className="mt-2 w-full rounded border border-stone-200 bg-white px-2 py-1 text-xs"
                        value={order.status}
                        onChange={(e) => {
                          updateOrderStatus(order.id, e.target.value as Order["status"]);
                          router.refresh();
                        }}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_CAMINO">En camino</option>
                        <option value="ENTREGADO">Entregado</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulario para añadir nota */}
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-stone-900">Añadir nota</h2>
        <form action={addTask} className="space-y-2">
          <Input
            label="Fecha"
            name="date"
            type="date"
            defaultValue={formatDateISO(new Date())}
          />
          <Input
            label="Título"
            name="title"
            placeholder="Ej: Revisar maíz"
          />
          <Textarea
            label="Detalles (opcional)"
            name="notes"
            placeholder="Observaciones..."
            rows={3}
          />
          {message && (
            <p className="text-xs text-agro-700 font-semibold">{message}</p>
          )}
          <Button type="submit" fullWidth>
            Guardar
          </Button>
        </form>
      </div>

      {/* Actividades sin asignar */}
      {unassignedOrders.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h2 className="mb-3 font-semibold text-yellow-900">
            Sin asignar ({unassignedOrders.length})
          </h2>
          <div className="space-y-2">
            {unassignedOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-2 text-xs">
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900">{order.clientName}</p>
                  <p className="text-yellow-800">{order.product}</p>
                </div>
                <select
                  className="rounded border border-yellow-300 bg-white px-2 py-1 text-xs"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      assignOrderToDay(order.id, e.target.value);
                      router.refresh();
                    }
                  }}
                >
                  <option value="">Asignar</option>
                  {days.map((day) => (
                    <option key={formatDateISO(day)} value={formatDateISO(day)}>
                      {formatDateShort(day)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

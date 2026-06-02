"use client";

import type { FieldTask, Order } from "@prisma/client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatDateISO,
  formatDateLong,
  formatDateShort,
  getWeekDays,
  parseDateISO,
} from "@/lib/dates";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/labels";
import { assignOrderToDay, updateOrderStatus } from "@/actions/orders";
import { createFieldTask, deleteFieldTask } from "@/actions/fieldTasks";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

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
  const [todayAlert, setTodayAlert] = useState("");

  function ordersForDay(day: Date) {
    const iso = formatDateISO(day);
    return orders.filter(
      (o) => o.plannedDay && formatDateISO(new Date(o.plannedDay)) === iso
    );
  }

  function tasksForDay(day: Date) {
    const iso = formatDateISO(day);
    return tasks.filter((t) => formatDateISO(new Date(t.date)) === iso);
  }

  async function assign(orderId: string, dayIso: string) {
    await assignOrderToDay(orderId, dayIso);
    router.refresh();
  }

  async function addTask(formData: FormData) {
    setMessage("");
    const res = await createFieldTask(formData);
    if (res.ok) {
      setMessage("Nota guardada correctamente.");
      router.refresh();
    } else {
      setMessage(res.error ?? "No se pudo guardar la nota.");
    }
  }

  const days = getWeekDays(weekStart);
  const today = new Date();
  const todayOrders = ordersForDay(today);
  const todayTasks = tasksForDay(today);
  const todayCount = todayOrders.length + todayTasks.length;

  const diaryTone = useMemo(() => {
    if (!diaryEntry) {
      return { label: "Sin bitácora hoy", badge: "bg-stone-100 text-stone-700" };
    }

    const text = diaryEntry.content.toLowerCase();
    if (text.includes("urgente") || text.includes("crítico") || text.includes("importante") || text.includes("prioridad")) {
      return { label: "Alta importancia", badge: "bg-red-100 text-red-900" };
    }
    if (text.includes("revisión") || text.includes("programa") || text.includes("entrega")) {
      return { label: "Importante", badge: "bg-amber-100 text-amber-900" };
    }
    return { label: "Normal", badge: "bg-emerald-100 text-emerald-900" };
  }, [diaryEntry]);

  useEffect(() => {
    if (todayCount > 0) {
      setTodayAlert(
        `Tienes ${todayCount} actividad${todayCount > 1 ? "es" : ""} para hoy.`
      );
    } else {
      setTodayAlert("No hay alertas activas para hoy. Aprovecha para revisar la semana.");
    }
  }, [todayCount]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-agro-800 via-agro-700 to-agro-600 p-8 shadow-2xl text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-agro-200">Agenda profesional</p>
            <h2 className="mt-3 text-4xl font-bold">Planificador semanal</h2>
            <p className="mt-3 max-w-2xl text-lg text-agro-100/90">
              Visualiza tus notas y actividades por día, organiza tu semana y exporta tus registros a Excel con un clic.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            <Link
              href={`/api/export/tasks?range=week&week=${weekKey}`}
              className="inline-flex min-h-[3.5rem] items-center justify-center rounded-3xl border border-white/20 bg-white/15 px-5 text-center text-lg font-semibold text-white transition hover:bg-white/25"
            >
              Descargar Excel
            </Link>
            <div className="inline-flex min-h-[3.5rem] items-center justify-center rounded-3xl border border-white/20 bg-white/15 px-5 text-center text-lg font-semibold text-white">
              Semana {weekKey}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.95fr]">
        <div className="space-y-6">
          <Card title="Alertas para hoy" subtitle={todayAlert} className="border-agro-300 bg-agro-50">
            {todayCount > 0 ? (
              <div className="grid gap-4">
                {todayTasks.length > 0 && (
                  <div>
                    <p className="mb-3 text-lg font-semibold text-agro-800">Notas y labores</p>
                    <ul className="space-y-3">
                      {todayTasks.map((task) => (
                        <li key={task.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                          <p className="font-semibold text-stone-900">{task.title}</p>
                          {task.notes && <p className="mt-2 text-sm text-stone-600">{task.notes}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {todayOrders.length > 0 && (
                  <div>
                    <p className="mb-3 text-lg font-semibold text-agro-800">Pedidos previstos</p>
                    <ul className="space-y-3">
                      {todayOrders.map((order) => (
                        <li key={order.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                          <p className="font-semibold text-stone-900">{order.clientName} · {order.product}</p>
                          <p className="mt-1 text-sm text-stone-600">{STATUS_LABELS[order.status]} · {PRIORITY_LABELS[order.priority]}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-lg text-stone-600">No tienes actividades asignadas para hoy. Revisa la semana y organiza tus tareas.</p>
            )}
          </Card>

          <Card title="Actividades sin fecha" subtitle="Añade estas notas al calendario para organizarlas mejor." className="border-yellow-300 bg-yellow-50">
            {unassignedOrders.length === 0 ? (
              <p className="text-lg text-stone-600">No hay actividades sin fecha. Todo está en el calendario.</p>
            ) : (
              <ul className="space-y-4">
                {unassignedOrders.map((order) => (
                  <li key={order.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-agro-900">{order.clientName}</p>
                        <p className="text-sm text-stone-600">{order.product} · {PRIORITY_LABELS[order.priority]}</p>
                      </div>
                      <div className="min-w-[12rem]">
                        <select
                          className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-base"
                          defaultValue=""
                          onChange={(e) => e.target.value && assign(order.id, e.target.value)}
                        >
                          <option value="">Asignar a un día</option>
                          {days.map((day) => (
                            <option key={formatDateISO(day)} value={formatDateISO(day)}>
                              {formatDateLong(day)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Resumen semanal" subtitle="Actividades programadas y notas para la semana." className="border-agro-300 bg-white/95">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-agro-50 p-5 text-center">
              <p className="text-4xl font-bold text-agro-900">{tasks.length}</p>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-stone-600">Notas creadas</p>
            </div>
            <div className="rounded-3xl bg-agro-50 p-5 text-center">
              <p className="text-4xl font-bold text-agro-900">{todayCount}</p>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-stone-600">Alertas de hoy</p>
            </div>
          </div>
          <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-lg font-semibold text-agro-900">Bitácora de hoy</p>
              <span className={`rounded-full px-4 py-2 text-sm font-semibold ${diaryTone.badge}`}>
                {diaryTone.label}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              {diaryEntry ? diaryEntry.content : "Aún no has registrado la bitácora de hoy. Ve a la pestaña Bitácora para anotar tu día."}
            </p>
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-agro-900">Semana detallada</h3>
            <p className="text-stone-600">Visualiza todas tus notas y actividades organizadas por día.</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-700 shadow-sm">
            <span className="font-semibold text-agro-900">Período</span>
            <span>{formatDateShort(weekStart)} — {formatDateShort(new Date(weekStart.getTime() + 6 * 86400000))}</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
          {days.map((day, i) => {
            const dayOrders = ordersForDay(day);
            const dayTasks = tasksForDay(day);
            return (
              <Card
                key={formatDateISO(day)}
                title={`${DAY_SHORT[i]} · ${formatDateShort(day)}`}
                className="min-h-[320px]"
              >
                <div className="space-y-5">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Notas</p>
                    {dayTasks.length === 0 ? (
                      <p className="mt-3 text-sm text-stone-500">No hay notas para este día.</p>
                    ) : (
                      <ul className="space-y-3">
                        {dayTasks.map((task) => (
                          <li key={task.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-stone-900">{task.title}</p>
                                {task.notes && <p className="mt-2 text-sm text-stone-600">{task.notes}</p>}
                              </div>
                              <button
                                type="button"
                                className="text-sm font-semibold text-red-700 hover:text-red-900"
                                onClick={async () => {
                                  await deleteFieldTask(task.id);
                                  router.refresh();
                                }}
                              >
                                Eliminar
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Pedidos</p>
                    {dayOrders.length === 0 ? (
                      <p className="mt-3 text-sm text-stone-500">Sin entregas programadas.</p>
                    ) : (
                      <ul className="space-y-3">
                        {dayOrders.map((order) => (
                          <li key={order.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                            <p className="font-semibold text-stone-900">{order.clientName}</p>
                            <p className="mt-1 text-sm text-stone-600">{order.product} · {PRIORITY_LABELS[order.priority]}</p>
                            <select
                              className="mt-3 w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm"
                              value={order.status}
                              onChange={async (e) => {
                                await updateOrderStatus(order.id, e.target.value as Order["status"]);
                                router.refresh();
                              }}
                            >
                              <option value="PENDIENTE">Pendiente</option>
                              <option value="EN_CAMINO">En camino</option>
                              <option value="ENTREGADO">Entregado</option>
                            </select>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Card title="Agregar nota rápida" subtitle="Escribe tu nueva actividad o recordatorio para la semana." className="border-agro-300 bg-white/95">
        <form action={addTask} className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <Input
              label="Fecha"
              name="date"
              type="date"
              required
              defaultValue={formatDateISO(new Date())}
            />
            <Input
              label="Título de la nota"
              name="title"
              required
              placeholder="Ej.: Revisión del cultivo de maíz"
            />
          </div>
          <Textarea
            label="Detalles (opcional)"
            name="notes"
            placeholder="Anota observaciones, insumos, ruta o cliente relacionado."
          />
          {message ? (
            <p className="rounded-3xl bg-agro-50 p-4 text-base text-agro-900" role="status">
              {message}
            </p>
          ) : null}
          <Button type="submit" fullWidth>
            Guardar nota
          </Button>
        </form>
      </Card>
    </div>
  );
}

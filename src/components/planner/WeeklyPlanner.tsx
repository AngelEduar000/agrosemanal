"use client";

import type { FieldTask, Order } from "@prisma/client";
import {
  formatDateISO,
  formatDateLong,
  getWeekDays,
  getWeekStart,
  parseDateISO,
} from "@/lib/dates";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/labels";
import { assignOrderToDay, updateOrderStatus } from "@/actions/orders";
import { createFieldTask, deleteFieldTask } from "@/actions/fieldTasks";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DAY_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function WeeklyPlanner({
  weekStartIso,
  orders,
  tasks,
  unassignedOrders,
}: {
  weekStartIso: string;
  orders: Order[];
  tasks: FieldTask[];
  unassignedOrders: Order[];
}) {
  const router = useRouter();
  const weekStart = parseDateISO(weekStartIso);
  const days = getWeekDays(weekStart);
  const [msg, setMsg] = useState("");

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
    setMsg("");
    const res = await createFieldTask(formData);
    if (res.ok) {
      setMsg("Labor de campo guardada.");
      router.refresh();
    } else {
      setMsg(res.error ?? "No se pudo guardar.");
    }
  }

  return (
    <div className="space-y-8">
      {unassignedOrders.length > 0 && (
        <Card
          title="Pedidos sin día asignado"
          subtitle="Asigne cada pedido a un día de la semana."
        >
          <ul className="space-y-3">
            {unassignedOrders.map((o) => (
              <li
                key={o.id}
                className={[
                  "rounded-lg border-2 p-4",
                  o.priority === "ALTA" ? "border-amber-500 bg-amber-50" : "border-stone-200",
                ].join(" ")}
              >
                <p className="text-lg font-semibold">
                  {o.clientName} — {o.product}
                  {o.priority === "ALTA" && (
                    <span className="ml-2 text-amber-800">(urgente)</span>
                  )}
                </p>
                <label className="mt-3 block text-base font-semibold">
                  Asignar al día:
                  <select
                    className="mt-1 w-full min-h-[3rem] rounded-lg border-2 border-stone-300 px-3 text-lg"
                    defaultValue=""
                    onChange={(e) => e.target.value && assign(o.id, e.target.value)}
                  >
                    <option value="">Seleccione un día…</option>
                    {days.map((d) => (
                      <option key={formatDateISO(d)} value={formatDateISO(d)}>
                        {formatDateLong(d)}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {days.map((day, i) => {
          const iso = formatDateISO(day);
          const dayOrders = ordersForDay(day);
          const dayTasks = tasksForDay(day);
          return (
            <Card
              key={iso}
              title={`${DAY_SHORT[i]} — ${formatDateLong(day)}`}
              className="min-h-[200px]"
            >
              <section className="mb-6">
                <h3 className="mb-3 text-lg font-bold text-agro-800">Entregas</h3>
                {dayOrders.length === 0 ? (
                  <p className="text-lg text-stone-500">Sin entregas planificadas.</p>
                ) : (
                  <ul className="space-y-3">
                    {dayOrders.map((o) => (
                      <li
                        key={o.id}
                        className={[
                          "rounded-lg border p-3 text-lg",
                          o.priority === "ALTA"
                            ? "border-amber-500 bg-amber-50 font-semibold"
                            : "border-stone-200 bg-stone-50",
                        ].join(" ")}
                      >
                        <p>{o.clientName}</p>
                        <p className="text-stone-700">
                          {o.product} · {PRIORITY_LABELS[o.priority]} ·{" "}
                          {STATUS_LABELS[o.status]}
                        </p>
                        <select
                          className="mt-2 w-full min-h-[2.5rem] rounded border border-stone-300 px-2"
                          value={o.status}
                          onChange={async (e) => {
                            await updateOrderStatus(
                              o.id,
                              e.target.value as Order["status"]
                            );
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
              </section>
              <section>
                <h3 className="mb-3 text-lg font-bold text-agro-800">Labores de campo</h3>
                {dayTasks.length === 0 ? (
                  <p className="text-lg text-stone-500">Sin labores registradas.</p>
                ) : (
                  <ul className="space-y-2">
                    {dayTasks.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-start justify-between gap-2 rounded-lg bg-agro-50 p-3 text-lg"
                      >
                        <div>
                          <p className="font-semibold">{t.title}</p>
                          {t.notes && <p className="text-stone-600">{t.notes}</p>}
                        </div>
                        <button
                          type="button"
                          className="shrink-0 text-base text-red-800 underline"
                          onClick={async () => {
                            await deleteFieldTask(t.id);
                            router.refresh();
                          }}
                        >
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </Card>
          );
        })}
      </div>

      <Card title="Agregar labor de campo" subtitle="Ej.: fumigación, visita a finca, muestreo.">
        <form action={addTask} className="space-y-4">
          <Input label="Fecha de la labor" name="date" type="date" required defaultValue={formatDateISO(new Date())} />
          <Input label="Nombre de la labor" name="title" required placeholder="Ej.: Visita técnica finca La Esperanza" />
          <Textarea label="Detalles (opcional)" name="notes" />
          {msg && <p className="text-lg text-agro-800" role="status">{msg}</p>}
          <Button type="submit">Guardar labor</Button>
        </form>
      </Card>
    </div>
  );
}

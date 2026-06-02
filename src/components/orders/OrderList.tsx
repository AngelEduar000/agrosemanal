"use client";

import type { Order, OrderStatus } from "@prisma/client";
import {
  CLIENT_TYPE_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/labels";
import { formatDateShort } from "@/lib/dates";
import { updateOrderStatus, deleteOrder } from "@/actions/orders";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function OrderList({ orders }: { orders: Order[] }) {
  const router = useRouter();

  async function changeStatus(id: string, status: OrderStatus) {
    await updateOrderStatus(id, status);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("¿Desea eliminar este pedido? Esta acción no se puede deshacer.")) return;
    await deleteOrder(id);
    router.refresh();
  }

  if (!orders.length) {
    return (
      <p className="rounded-lg bg-stone-100 p-6 text-center text-xl text-stone-700">
        No hay pedidos con los filtros seleccionados.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => {
        const isUrgent = order.priority === "ALTA";
        return (
          <li
            key={order.id}
            className={[
              "rounded-xl border-2 p-5",
              isUrgent
                ? "border-amber-500 bg-amber-50"
                : "border-stone-200 bg-white",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-stone-600">
                  {formatDateShort(new Date(order.date))}
                  {isUrgent && (
                    <span className="ml-3 rounded-md bg-amber-600 px-3 py-1 text-base font-bold text-white">
                      URGENTE
                    </span>
                  )}
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-agro-900">
                  {order.clientName}
                </h3>
                <p className="text-lg text-stone-700">
                  {CLIENT_TYPE_LABELS[order.clientType]} · {order.product} ·{" "}
                  {order.quantity}
                </p>
              </div>
              <div className="text-right text-lg">
                <p className="font-semibold">{PRIORITY_LABELS[order.priority]}</p>
                <p className="text-agro-800">{STATUS_LABELS[order.status]}</p>
              </div>
            </div>
            <p className="mt-3 text-lg text-stone-700">
              <span className="font-semibold">Entrega:</span> {order.address}
            </p>
            {order.notes && (
              <p className="mt-2 text-lg text-stone-600">
                <span className="font-semibold">Notas:</span> {order.notes}
              </p>
            )}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <label className="flex flex-1 flex-col gap-1 text-base font-semibold">
                Cambiar estado
                <select
                  className="min-h-[3rem] rounded-lg border-2 border-stone-300 px-3 text-lg"
                  value={order.status}
                  onChange={(e) =>
                    changeStatus(order.id, e.target.value as OrderStatus)
                  }
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_CAMINO">En camino</option>
                  <option value="ENTREGADO">Entregado</option>
                </select>
              </label>
              <Button
                type="button"
                variant="outline"
                className="sm:self-end"
                onClick={() => remove(order.id)}
              >
                Eliminar
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

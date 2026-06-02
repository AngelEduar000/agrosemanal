import { getOrders } from "@/actions/orders";
import { OrderForm } from "@/components/orders/OrderForm";
import { OrderList } from "@/components/orders/OrderList";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { Card } from "@/components/ui/Card";
import { getWeekKey } from "@/lib/dates";
import type { OrderStatus } from "@prisma/client";
import { Suspense } from "react";

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; week?: string }>;
}) {
  const params = await searchParams;
  const currentWeek = getWeekKey(new Date());
  const week = params.week ?? currentWeek;
  const status = (params.status ?? "ALL") as OrderStatus | "ALL";

  const orders = await getOrders({ status, week });

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-4xl font-bold text-agro-900">Pedidos</h1>
        <p className="mt-2 text-xl text-stone-700">
          Registre entregas y consulte el listado ordenado por prioridad.
        </p>
      </header>

      <OrderForm />

      <Suspense fallback={<p className="text-lg">Cargando filtros…</p>}>
        <OrderFilters currentWeek={currentWeek} />
      </Suspense>

      <Card
        title="Listado de pedidos"
        subtitle="Los pedidos urgentes aparecen resaltados en color ámbar."
      >
        <OrderList orders={orders} />
      </Card>
    </div>
  );
}

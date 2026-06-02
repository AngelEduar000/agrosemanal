"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatWeekRange, getWeekKey, getWeekStart } from "@/lib/dates";
import { Select } from "@/components/ui/Select";

export function OrderFilters({ currentWeek }: { currentWeek: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "ALL";
  const week = searchParams.get("week") ?? currentWeek;

  const weekStart = getWeekStart(new Date());

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" && key === "status") params.delete("status");
    else params.set(key, value);
    router.push(`/pedidos?${params.toString()}`);
  }

  return (
    <div className="space-y-4 rounded-xl border-2 border-stone-200 bg-white p-5">
      <h2 className="font-display text-xl font-semibold text-agro-800">Filtrar pedidos</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Estado"
          value={status}
          onChange={(e) => update("status", e.target.value)}
          options={[
            { value: "ALL", label: "Todos los estados" },
            { value: "PENDIENTE", label: "Pendiente" },
            { value: "EN_CAMINO", label: "En camino" },
            { value: "ENTREGADO", label: "Entregado" },
          ]}
        />
        <Select
          label="Semana"
          value={week}
          onChange={(e) => update("week", e.target.value)}
          options={[
            { value: currentWeek, label: `Esta semana (${formatWeekRange(weekStart)})` },
            {
              value: getWeekKey(new Date(weekStart.getTime() - 7 * 86400000)),
              label: "Semana anterior",
            },
          ]}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/api/export/orders?range=week&week=${week}`}
          className="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-lg border-2 border-agro-600 bg-agro-50 px-4 text-lg font-semibold text-agro-800 hover:bg-agro-100"
        >
          Descargar Excel (semana)
        </Link>
        <Link
          href="/api/export/orders?range=month"
          className="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-lg border-2 border-agro-600 bg-agro-50 px-4 text-lg font-semibold text-agro-800 hover:bg-agro-100"
        >
          Descargar Excel (mes actual)
        </Link>
      </div>
    </div>
  );
}

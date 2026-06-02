"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDateISO, getWeekKey, parseDateISO } from "@/lib/dates";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ClientType, OrderStatus, Priority } from "@prisma/client";

const orderSchema = z.object({
  date: z.string(),
  clientName: z.string().min(1, "Indique el nombre del cliente"),
  clientType: z.enum(["PERSONA", "ALMACEN", "FINCA"]),
  product: z.string().min(1, "Indique el producto"),
  quantity: z.string().min(1, "Indique la cantidad"),
  address: z.string().min(1, "Indique la dirección de entrega"),
  priority: z.enum(["ALTA", "MEDIA", "BAJA"]),
  status: z.enum(["PENDIENTE", "EN_CAMINO", "ENTREGADO"]),
  notes: z.string().optional(),
  plannedDay: z.string().optional(),
});

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  return session;
}

export async function createOrder(formData: FormData) {
  await requireSession();

  const parsed = orderSchema.safeParse({
    date: formData.get("date"),
    clientName: formData.get("clientName"),
    clientType: formData.get("clientType"),
    product: formData.get("product"),
    quantity: formData.get("quantity"),
    address: formData.get("address"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
    plannedDay: formData.get("plannedDay") || undefined,
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const date = parseDateISO(parsed.data.date);
  const plannedDay = parsed.data.plannedDay
    ? parseDateISO(parsed.data.plannedDay)
    : null;

  await prisma.order.create({
    data: {
      date,
      clientName: parsed.data.clientName,
      clientType: parsed.data.clientType as ClientType,
      product: parsed.data.product,
      quantity: parsed.data.quantity,
      address: parsed.data.address,
      priority: parsed.data.priority as Priority,
      status: parsed.data.status as OrderStatus,
      notes: parsed.data.notes || null,
      week: getWeekKey(date),
      plannedDay,
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/planificador");
  return { ok: true as const };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await requireSession();
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/pedidos");
  revalidatePath("/planificador");
  return { ok: true as const };
}

export async function assignOrderToDay(id: string, plannedDay: string | null) {
  await requireSession();
  await prisma.order.update({
    where: { id },
    data: {
      plannedDay: plannedDay ? parseDateISO(plannedDay) : null,
    },
  });
  revalidatePath("/planificador");
  return { ok: true as const };
}

export async function deleteOrder(id: string) {
  await requireSession();
  await prisma.order.delete({ where: { id } });
  revalidatePath("/pedidos");
  revalidatePath("/planificador");
  return { ok: true as const };
}

export async function getOrders(filters: {
  status?: OrderStatus | "ALL";
  week?: string;
}) {
  await requireSession();

  const where: {
    status?: OrderStatus;
    week?: string;
  } = {};

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters.week) {
    where.week = filters.week;
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: [{ priority: "asc" }, { date: "asc" }],
  });

  const priorityRank = { ALTA: 0, MEDIA: 1, BAJA: 2 };
  orders.sort(
    (a, b) =>
      priorityRank[a.priority] - priorityRank[b.priority] ||
      new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return orders;
}

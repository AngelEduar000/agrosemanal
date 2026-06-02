"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseDateISO } from "@/lib/dates";
import { revalidatePath } from "next/cache";

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  return session;
}

export async function createFieldTask(formData: FormData) {
  await requireSession();

  const date = String(formData.get("date") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title) {
    return { ok: false as const, error: "Indique el nombre de la labor." };
  }

  await prisma.fieldTask.create({
    data: {
      date: parseDateISO(date),
      title,
      notes: notes || null,
    },
  });

  revalidatePath("/planificador");
  return { ok: true as const };
}

export async function deleteFieldTask(id: string) {
  await requireSession();
  await prisma.fieldTask.delete({ where: { id } });
  revalidatePath("/planificador");
  return { ok: true as const };
}

export async function getFieldTasksForWeek(weekStartIso: string) {
  await requireSession();
  const start = parseDateISO(weekStartIso);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return prisma.fieldTask.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
  });
}

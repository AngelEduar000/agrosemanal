"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseDateISO } from "@/lib/dates";
import { revalidatePath } from "next/cache";
import type { Priority } from "@prisma/client";

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
  const priority = (String(formData.get("priority") ?? "MEDIA")) as Priority;
  const scheduledTime = String(formData.get("scheduledTime") ?? "").trim();

  if (!title) {
    return { ok: false as const, error: "Indique el nombre de la labor." };
  }

  await prisma.fieldTask.create({
    data: {
      date: parseDateISO(date),
      title,
      notes: notes || null,
      priority,
      completed: false,
      scheduledTime: scheduledTime || null,
    },
  });

  revalidatePath("/planificador");
  return { ok: true as const };
}

export async function updateFieldTask(
  id: string,
  data: {
    title?: string;
    notes?: string | null;
    date?: string;
    priority?: Priority;
    scheduledTime?: string | null;
    completed?: boolean;
  }
) {
  await requireSession();

  const updateData: {
    title?: string;
    notes?: string | null;
    date?: Date;
    priority?: Priority;
    scheduledTime?: string | null;
    completed?: boolean;
  } = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.notes !== undefined) updateData.notes = data.notes ? data.notes.trim() : null;
  if (data.date !== undefined) updateData.date = parseDateISO(data.date);
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.scheduledTime !== undefined) updateData.scheduledTime = data.scheduledTime || null;
  if (data.completed !== undefined) updateData.completed = data.completed;

  await prisma.fieldTask.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/planificador");
  return { ok: true as const };
}

export async function toggleFieldTaskCompleted(id: string, completed: boolean) {
  await requireSession();
  await prisma.fieldTask.update({
    where: { id },
    data: { completed },
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

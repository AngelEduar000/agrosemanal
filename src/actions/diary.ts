"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseDateISO, formatDateISO, startOfDay } from "@/lib/dates";
import { revalidatePath } from "next/cache";

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  return session;
}

export async function saveDiaryEntry(dateIso: string, content: string) {
  await requireSession();

  const date = parseDateISO(dateIso);
  const trimmed = content.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Escriba algo en la bitácora antes de guardar." };
  }

  await prisma.diaryEntry.upsert({
    where: { date },
    create: { date, content: trimmed },
    update: { content: trimmed },
  });

  revalidatePath("/bitacora");
  return { ok: true as const };
}

export async function getDiaryEntry(dateIso: string) {
  await requireSession();
  const date = parseDateISO(dateIso);
  return prisma.diaryEntry.findUnique({ where: { date } });
}

export async function hasDiaryToday() {
  await requireSession();
  const today = formatDateISO(startOfDay(new Date()));
  const entry = await getDiaryEntry(today);
  return !!entry;
}

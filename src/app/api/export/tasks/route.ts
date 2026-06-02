import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDateShort, getWeekKey, getWeekStartForKey } from "@/lib/dates";
import * as XLSX from "xlsx";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const range = req.nextUrl.searchParams.get("range") ?? "week";
  const weekParam = req.nextUrl.searchParams.get("week");

  let tasks;
  if (range === "month") {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    tasks = await prisma.fieldTask.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: "asc" },
    });
  } else {
    const weekKey = weekParam ?? getWeekKey(new Date());
    const weekStart = getWeekStartForKey(weekKey);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    tasks = await prisma.fieldTask.findMany({
      where: { date: { gte: weekStart, lte: end } },
      orderBy: { date: "asc" },
    });
  }

  const rows = tasks.map((task) => ({
    Fecha: formatDateShort(new Date(task.date)),
    Tarea: task.title,
    Notas: task.notes ?? "",
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Notas");
  const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" });

  const filename =
    range === "month"
      ? `notas-mes-${new Date().getMonth() + 1}-${new Date().getFullYear()}.xlsx`
      : `notas-semana-${weekParam ?? getWeekKey(new Date())}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

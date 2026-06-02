import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDateShort, getWeekKey, getWeekStartForKey } from "@/lib/dates";
import * as XLSX from "xlsx";
import { NextRequest, NextResponse } from "next/server";

function getImportance(content: string) {
  const text = content.toLowerCase();
  if (
    text.includes("urgente") ||
    text.includes("crítico") ||
    text.includes("prioridad") ||
    text.includes("importante")
  ) {
    return "Alta";
  }
  if (
    text.includes("revisión") ||
    text.includes("programa") ||
    text.includes("entrega") ||
    text.includes("actualizar")
  ) {
    return "Media";
  }
  return "Normal";
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const range = req.nextUrl.searchParams.get("range") ?? "week";
  const weekParam = req.nextUrl.searchParams.get("week");

  let start: Date;
  let end: Date;

  if (range === "month") {
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    const weekKey = weekParam ?? getWeekKey(new Date());
    start = getWeekStartForKey(weekKey);
    end = new Date(start);
    end.setDate(end.getDate() + 6);
  }

  // Fetch both tasks and diary entries in parallel
  const [tasks, diaryEntries] = await Promise.all([
    prisma.fieldTask.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: "asc" },
    }),
    prisma.diaryEntry.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: "asc" },
    }),
  ]);

  // Map Tasks
  const taskRows = tasks.map((task) => ({
    Fecha: formatDateShort(new Date(task.date)),
    Hora: task.scheduledTime ?? "Todo el día",
    Tarea: task.title,
    Prioridad:
      task.priority === "ALTA"
        ? "Alta"
        : task.priority === "MEDIA"
          ? "Media"
          : "Baja",
    Completada: task.completed ? "Sí" : "No",
    Notas: task.notes ?? "",
  }));

  // Map Diary
  const diaryRows = diaryEntries.map((entry) => ({
    Fecha: formatDateShort(new Date(entry.date)),
    "Contenido del Registro": entry.content,
    Importancia: getImportance(entry.content),
  }));

  const sheetTasks = XLSX.utils.json_to_sheet(taskRows);
  const sheetDiary = XLSX.utils.json_to_sheet(diaryRows);
  
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheetTasks, "Labores y Tareas");
  XLSX.utils.book_append_sheet(book, sheetDiary, "Bitácora Diaria");

  const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" });

  const filename =
    range === "month"
      ? `reporte-mensual-${new Date().getMonth() + 1}-${new Date().getFullYear()}.xlsx`
      : `reporte-semanal-${weekParam ?? getWeekKey(new Date())}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

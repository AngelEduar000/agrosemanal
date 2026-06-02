import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  CLIENT_TYPE_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/labels";
import { formatDateShort, getWeekKey } from "@/lib/dates";
import * as XLSX from "xlsx";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const range = req.nextUrl.searchParams.get("range") ?? "week";
  const weekParam = req.nextUrl.searchParams.get("week");

  let orders;

  if (range === "month") {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    orders = await prisma.order.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: "asc" },
    });
  } else {
    const week = weekParam ?? getWeekKey(new Date());
    orders = await prisma.order.findMany({
      where: { week },
      orderBy: { date: "asc" },
    });
  }

  const rows = orders.map((o) => ({
    Fecha: formatDateShort(new Date(o.date)),
    Cliente: o.clientName,
    "Tipo de cliente": CLIENT_TYPE_LABELS[o.clientType],
    Producto: o.product,
    Cantidad: o.quantity,
    Prioridad: PRIORITY_LABELS[o.priority],
    Estado: STATUS_LABELS[o.status],
    Dirección: o.address,
    Notas: o.notes ?? "",
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Pedidos");
  const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" });

  const filename =
    range === "month"
      ? `pedidos-mes-${new Date().getMonth() + 1}-${new Date().getFullYear()}.xlsx`
      : `pedidos-semana-${weekParam ?? getWeekKey(new Date())}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

import type { FieldTask, Order } from "@prisma/client";
import { PRIORITY_LABELS, STATUS_LABELS } from "./labels";
import { formatDateShort, formatWeekRange } from "./dates";
import { createResendClient, getEmailFrom } from "./resend-client";

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const resend = createResendClient();
  const from = getEmailFrom();

  if (!resend) {
    console.error("[email] Falta AUTH_RESEND_KEY o RESEND_API_KEY");
    return { ok: false as const, skipped: true, reason: "no_api_key" as const };
  }

  // Generate plain text version from HTML if not provided
  const plainText = text || html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text: plainText,
    headers: {
      'List-Unsubscribe': `<mailto:unsubscribe@agrosemanal.com?subject=unsubscribe>`,
      'X-Priority': '3',
      'X-Mailer': 'AgroSemanal',
    },
  });

  if (error) {
    console.error("[email] Resend:", error);
    return { ok: false as const, error, reason: "resend_error" as const };
  }

  console.info("[email] Enviado:", { to, subject, id: data?.id });
  return { ok: true as const, id: data?.id };
}

export function buildWeeklySummaryHtml(orders: Order[], weekLabel: string) {
  const delivered = orders.filter((o) => o.status === "ENTREGADO");
  const pending = orders.filter((o) => o.status !== "ENTREGADO");
  const urgent = orders.filter((o) => o.priority === "ALTA" && o.status !== "ENTREGADO");

  const row = (o: Order) =>
    `<tr>
      <td style="padding:8px;border:1px solid #ddd">${formatDateShort(new Date(o.date))}</td>
      <td style="padding:8px;border:1px solid #ddd">${o.clientName}</td>
      <td style="padding:8px;border:1px solid #ddd">${o.product}</td>
      <td style="padding:8px;border:1px solid #ddd">${PRIORITY_LABELS[o.priority]}</td>
      <td style="padding:8px;border:1px solid #ddd">${STATUS_LABELS[o.status]}</td>
    </tr>`;

  return `
    <div style="font-family:Georgia,serif;max-width:640px;margin:0 auto;color:#283522">
      <h1 style="font-size:24px;color:#476339">Resumen semanal — AgroSemanal</h1>
      <p style="font-size:18px">Semana: <strong>${weekLabel}</strong></p>
      <p style="font-size:16px">Entregados: <strong>${delivered.length}</strong> · Pendientes: <strong>${pending.length}</strong> · Urgentes: <strong>${urgent.length}</strong></p>
      ${
        urgent.length
          ? `<h2 style="font-size:20px;color:#8b4513">Pedidos urgentes</h2>
             <table style="width:100%;border-collapse:collapse;font-size:16px">${urgent.map(row).join("")}</table>`
          : ""
      }
      <h2 style="font-size:20px">Todos los pedidos de la semana</h2>
      <table style="width:100%;border-collapse:collapse;font-size:16px">
        <thead><tr style="background:#e6ede0">
          <th style="padding:8px;border:1px solid #ddd">Fecha</th>
          <th style="padding:8px;border:1px solid #ddd">Cliente</th>
          <th style="padding:8px;border:1px solid #ddd">Producto</th>
          <th style="padding:8px;border:1px solid #ddd">Prioridad</th>
          <th style="padding:8px;border:1px solid #ddd">Estado</th>
        </tr></thead>
        <tbody>${orders.map(row).join("")}</tbody>
      </table>
      <p style="font-size:14px;color:#666;margin-top:24px">AgroSemanal — gestión personal de pedidos agrícolas</p>
    </div>
  `;
}

export function buildDiaryReminderHtml() {
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://tu-app.vercel.app";
  return `
    <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#283522">
      <h1 style="font-size:22px;color:#476339">Recordatorio de bitácora</h1>
      <p style="font-size:18px;line-height:1.6">
        Aún no ha registrado la bitácora de hoy en AgroSemanal.
        Tómese un momento para anotar entregas, labores de campo o el clima del día.
      </p>
      <p style="font-size:16px"><a href="${baseUrl}/bitacora" style="color:#476339">Abrir bitácora</a></p>
    </div>
  `;
}

function tasksToRows(tasks: FieldTask[]) {
  return tasks
    .map(
      (task) => `<tr>
        <td style="padding:8px;border:1px solid #ddd">${formatDateShort(new Date(task.date))}</td>
        <td style="padding:8px;border:1px solid #ddd">${task.title}</td>
        <td style="padding:8px;border:1px solid #ddd">${task.notes ?? ""}</td>
      </tr>`
    )
    .join("");
}

export function buildDailyActivityHtml(
  todayOrders: Order[],
  tomorrowOrders: Order[],
  todayTasks: FieldTask[],
  tomorrowTasks: FieldTask[]
) {
  const section = (title: string, rows: string) => `
    <div style="margin-top:24px">
      <h2 style="font-size:20px;color:#476339">${title}</h2>
      ${rows}
    </div>`;

  const orderSection = (label: string, items: Order[]) =>
    items.length
      ? `<table style="width:100%;border-collapse:collapse;font-size:16px">
          <thead>
            <tr style="background:#e6ede0">
              <th style="padding:8px;border:1px solid #ddd">Fecha</th>
              <th style="padding:8px;border:1px solid #ddd">Cliente</th>
              <th style="padding:8px;border:1px solid #ddd">Producto</th>
              <th style="padding:8px;border:1px solid #ddd">Prioridad</th>
              <th style="padding:8px;border:1px solid #ddd">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (order) => `<tr>
                <td style="padding:8px;border:1px solid #ddd">${formatDateShort(new Date(order.date))}</td>
                <td style="padding:8px;border:1px solid #ddd">${order.clientName}</td>
                <td style="padding:8px;border:1px solid #ddd">${order.product}</td>
                <td style="padding:8px;border:1px solid #ddd">${PRIORITY_LABELS[order.priority]}</td>
                <td style="padding:8px;border:1px solid #ddd">${STATUS_LABELS[order.status]}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>`
      : `<p style="font-size:16px;color:#55685d">No hay ${label.toLowerCase()} programadas.</p>`;

  const taskSection = (label: string, items: FieldTask[]) =>
    items.length
      ? `<table style="width:100%;border-collapse:collapse;font-size:16px">
          <thead>
            <tr style="background:#e6ede0">
              <th style="padding:8px;border:1px solid #ddd">Fecha</th>
              <th style="padding:8px;border:1px solid #ddd">Tarea</th>
              <th style="padding:8px;border:1px solid #ddd">Notas</th>
            </tr>
          </thead>
          <tbody>
            ${tasksToRows(items)}
          </tbody>
        </table>`
      : `<p style="font-size:16px;color:#55685d">No hay ${label.toLowerCase()} registradas.</p>`;

  return `
    <div style="font-family:Georgia,serif;max-width:640px;margin:0 auto;color:#283522">
      <h1 style="font-size:24px;color:#476339">Resumen de actividades</h1>
      <p style="font-size:18px;line-height:1.7">Aquí está lo que tienes programado para hoy y mañana. Revisa tu agenda y actúa sobre lo más importante.</p>
      ${section("Actividades para hoy", orderSection("Pedidos de hoy", todayOrders) + taskSection("Notas de hoy", todayTasks))}
      ${section("Actividades para mañana", orderSection("Pedidos de mañana", tomorrowOrders) + taskSection("Notas de mañana", tomorrowTasks))}
      <p style="font-size:14px;color:#666;margin-top:24px">AgroSemanal — gestión profesional de tu calendario agrícola.</p>
    </div>
  `;
}

export async function sendDailyActivityReminder(
  to: string,
  todayOrders: Order[],
  tomorrowOrders: Order[],
  todayTasks: FieldTask[],
  tomorrowTasks: FieldTask[]
) {
  return sendEmail({
    to,
    subject: "Recordatorio AgroSemanal: actividades para hoy y mañana",
    html: buildDailyActivityHtml(todayOrders, tomorrowOrders, todayTasks, tomorrowTasks),
  });
}

export async function sendWeeklySummary(to: string, orders: Order[], weekStart: Date) {
  const weekLabel = formatWeekRange(weekStart);
  return sendEmail({
    to,
    subject: `Resumen semanal AgroSemanal — ${weekLabel}`,
    html: buildWeeklySummaryHtml(orders, weekLabel),
  });
}

export async function sendDiaryReminder(to: string) {
  return sendEmail({
    to,
    subject: "Recordatorio: complete su bitácora de hoy",
    html: buildDiaryReminderHtml(),
  });
}

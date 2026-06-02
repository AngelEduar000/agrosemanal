"use client";

import { useMemo, useState } from "react";
import { saveDiaryEntry } from "@/actions/diary";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateLong, parseDateISO } from "@/lib/dates";
import Link from "next/link";

function getImportance(content: string) {
  const text = content.toLowerCase();
  if (
    text.includes("urgente") ||
    text.includes("crítico") ||
    text.includes("prioridad") ||
    text.includes("importante")
  ) {
    return {
      label: "Alta",
      badge: "bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900/30",
    };
  }
  if (
    text.includes("revisión") ||
    text.includes("programa") ||
    text.includes("entrega") ||
    text.includes("actualizar")
  ) {
    return {
      label: "Media",
      badge: "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/30",
    };
  }
  return {
    label: "Normal",
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/30",
  };
}

export function DiaryEditor({
  dateIso,
  initialContent,
}: {
  dateIso: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const importance = useMemo(() => getImportance(content), [content]);

  async function handleSave() {
    setPending(true);
    setMessage("");
    const result = await saveDiaryEntry(dateIso, content);
    setPending(false);
    if (result.ok) {
      setMessage("Bitácora guardada correctamente.");
    } else {
      setMessage(result.error ?? "No se pudo guardar.");
    }
  }

  const dateLabel = formatDateLong(parseDateISO(dateIso));

  return (
    <Card
      title="Bitácora del día"
      subtitle={dateLabel}
      className="dark:border-white/10 dark:bg-stone-900/80 dark:shadow-stone-950/40"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-[24px] border border-stone-200 bg-stone-50/80 p-4 dark:border-stone-850 dark:bg-stone-950/40">
          <div className="flex items-center justify-between gap-4">
            <p className="text-base font-semibold text-stone-850 dark:text-stone-200">
              Importancia detectada
            </p>
            <span
              className={`rounded-full px-4.5 py-1.5 text-xs font-bold border transition ${importance.badge}`}
            >
              {importance.label}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
            La etiqueta de importancia se actualiza según las palabras clave que
            describen tu bitácora.
          </p>
        </div>

        <Input
          label="Fecha de Registro"
          type="date"
          value={dateIso}
          readOnly
          onChange={() => {}}
          className="dark:bg-stone-850 dark:border-stone-700 dark:text-white"
        />
        
        <Textarea
          label="¿Qué hiciste hoy?"
          hint="Describe tus labores, entregas, clima o cualquier observación importante."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ej.: Entregué fertilizantes, monitoreé plagas y coordiné la cosecha en la tarde."
          className="dark:bg-stone-850 dark:border-stone-700 dark:text-white"
        />

        {message && (
          <p
            className={`rounded-2xl p-4 text-xs font-semibold ${
              message.includes("correctamente")
                ? "bg-agro-50 text-agro-900 border border-agro-100 dark:bg-agro-950/20 dark:text-agro-400 dark:border-agro-900/30"
                : "bg-red-50 text-red-900 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
            }`}
            role="status"
          >
            {message}
          </p>
        )}

        <Button
          type="button"
          fullWidth
          onClick={handleSave}
          disabled={pending}
          className="rounded-xl min-h-[38px] font-bold bg-agro-700 hover:bg-agro-800"
        >
          {pending ? "Guardando…" : "Guardar bitácora"}
        </Button>

        {/* Acceso rápidos y Exportar Excel */}
        <div className="flex gap-3 pt-3 border-t border-stone-200/50 dark:border-stone-800/60 flex-wrap">
          <Link
            href="/planificador"
            className="flex-1 inline-flex min-h-[38px] items-center justify-center rounded-xl border border-stone-200/60 bg-white/80 dark:border-stone-700/60 dark:bg-stone-850 px-4 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40 cursor-pointer shadow-sm transition-all duration-200"
          >
            📅 Ver en Calendario
          </Link>
          <a
            href="/api/export/tasks?range=month"
            className="flex-1 inline-flex min-h-[38px] items-center justify-center rounded-xl border border-agro-600 bg-agro-50 dark:bg-agro-950/20 px-4 text-xs font-bold text-agro-800 dark:text-agro-400 hover:bg-agro-100 transition shadow-sm"
          >
            📥 Exportar Reporte Excel
          </a>
        </div>
      </div>
    </Card>
  );
}

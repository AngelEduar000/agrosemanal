"use client";

import { useMemo, useState } from "react";
import { saveDiaryEntry } from "@/actions/diary";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateLong, parseDateISO } from "@/lib/dates";

function getImportance(content: string) {
  const text = content.toLowerCase();
  if (text.includes("urgente") || text.includes("crítico") || text.includes("prioridad") || text.includes("importante")) {
    return { label: "Alta", badge: "bg-red-100 text-red-900" };
  }
  if (text.includes("revisión") || text.includes("programa") || text.includes("entrega") || text.includes("actualizar")) {
    return { label: "Media", badge: "bg-amber-100 text-amber-900" };
  }
  return { label: "Normal", badge: "bg-emerald-100 text-emerald-900" };
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
    <Card title="Bitácora del día" subtitle={dateLabel}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-stone-200 bg-stone-50/80 p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-base font-semibold text-stone-800">Importancia detectada</p>
            <span className={`rounded-full px-4 py-2 text-sm font-semibold ${importance.badge}`}>
              {importance.label}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-stone-600">
            La etiqueta de importancia se actualiza según las palabras clave que describen tu bitácora.
          </p>
        </div>

        <Input
          label="Fecha"
          type="date"
          value={dateIso}
          readOnly
          onChange={() => {}}
        />
        <Textarea
          label="¿Qué hiciste hoy?"
          hint="Describe tus labores, entregas, clima o cualquier observación importante."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ej.: Entregué fertilizantes, monitoreé plagas y coordiné la cosecha en la tarde."
        />
        {message && (
          <p
            className={`rounded-3xl p-4 text-base ${
              message.includes("correctamente")
                ? "bg-agro-50 text-agro-900"
                : "bg-red-50 text-red-900"
            }`}
            role="status"
          >
            {message}
          </p>
        )}
        <Button type="button" fullWidth onClick={handleSave} disabled={pending}>
          {pending ? "Guardando…" : "Guardar bitácora"}
        </Button>
      </div>
    </Card>
  );
}

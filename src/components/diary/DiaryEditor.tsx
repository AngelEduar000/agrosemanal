"use client";

import { useState } from "react";
import { saveDiaryEntry } from "@/actions/diary";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateLong, parseDateISO } from "@/lib/dates";

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
    >
      <div className="space-y-6">
        <Input
          label="Fecha"
          type="date"
          value={dateIso}
          readOnly
          onChange={() => {}}
        />
        <Textarea
          label="¿Qué hizo hoy?"
          hint="Puede anotar entregas, labores de campo, clima, insumos usados u otras observaciones."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ej.: Entregué 15 sacos de fertilizante en la finca El Roble. Lluvia ligera por la tarde."
        />
        {message && (
          <p
            className={`rounded-lg p-4 text-lg ${
              message.includes("correctamente")
                ? "bg-agro-100 text-agro-900"
                : "bg-amber-50 text-amber-900"
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

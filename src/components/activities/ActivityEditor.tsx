"use client";

import { useState, useEffect } from "react";
import { createFieldTask, updateFieldTask, deleteFieldTask } from "@/actions/fieldTasks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { FieldTask, Priority } from "@prisma/client";
import { formatDateISO } from "@/lib/dates";
import { useRouter } from "next/navigation";

export function ActivityEditor({
  isOpen,
  onClose,
  task = null,
  defaultDate = "",
  onSaveSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  task?: FieldTask | null;
  defaultDate?: string;
  onSaveSuccess?: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIA");
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  // Sync state when task or defaultDate changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDate(formatDateISO(new Date(task.date)));
      setScheduledTime(task.scheduledTime ?? "");
      setPriority(task.priority);
      setCompleted(task.completed);
      setNotes(task.notes ?? "");
      setError("");
    } else {
      setTitle("");
      setDate(defaultDate || formatDateISO(new Date()));
      setScheduledTime("");
      setPriority("MEDIA");
      setCompleted(false);
      setNotes("");
      setError("");
    }
  }, [task, defaultDate, isOpen]);

  if (!isOpen) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");

    try {
      if (task) {
        // Edit Mode
        const res = await updateFieldTask(task.id, {
          title,
          date,
          scheduledTime: scheduledTime || null,
          priority,
          completed,
          notes: notes || null,
        });

        if (res.ok) {
          router.refresh();
          if (onSaveSuccess) onSaveSuccess();
          onClose();
        } else {
          setError("No se pudo actualizar la labor.");
        }
      } else {
        // Create Mode
        const formData = new FormData();
        formData.append("title", title);
        formData.append("date", date);
        formData.append("scheduledTime", scheduledTime);
        formData.append("priority", priority);
        formData.append("notes", notes);

        const res = await createFieldTask(formData);
        if (res.ok) {
          router.refresh();
          if (onSaveSuccess) onSaveSuccess();
          onClose();
        } else {
          setError(res.error ?? "No se pudo guardar la labor.");
        }
      }
    } catch {
      setError("Ha ocurrido un error inesperado.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirm("¿Deseas eliminar esta labor de forma permanente?")) return;

    setPending(true);
    setError("");
    try {
      const res = await deleteFieldTask(task.id);
      if (res.ok) {
        router.refresh();
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      } else {
        setError("No se pudo eliminar la labor.");
      }
    } catch {
      setError("Error al intentar eliminar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
      <div 
        className={[
          "w-full max-w-lg overflow-hidden transition-all duration-300 transform scale-100",
          "rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl",
          "dark:border-white/10 dark:bg-stone-900/90 dark:shadow-stone-950/60"
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-stone-800/60 pb-3 mb-4">
          <h2 className="text-lg font-display font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <span>{task ? "✏️ Editar Labor" : "🌱 Nueva Labor"}</span>
          </h2>
          <button 
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white text-lg font-bold p-1 rounded-lg transition"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <p className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200/50 dark:border-red-900/50" role="alert">
              ⚠️ {error}
            </p>
          )}

          <div className="space-y-3">
            <Input
              label="Nombre de la Labor"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej.: Fumigar lote norte, Abonar maíz..."
              required
              className="dark:bg-stone-800/80 dark:border-stone-700 dark:text-white"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Fecha"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="dark:bg-stone-800/80 dark:border-stone-700 dark:text-white"
              />
              <Input
                label="Hora Programada (opcional)"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="dark:bg-stone-800/80 dark:border-stone-700 dark:text-white"
              />
            </div>

            {/* Selector de Prioridad */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-900 dark:text-stone-300">
                Prioridad
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["ALTA", "MEDIA", "BAJA"] as Priority[]).map((p) => {
                  const isActive = priority === p;
                  const stylesMap = {
                    ALTA: isActive 
                      ? "bg-red-500 text-white border-red-600 shadow-sm" 
                      : "bg-red-50/50 text-red-700 border-red-200 hover:bg-red-50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40",
                    MEDIA: isActive 
                      ? "bg-blue-500 text-white border-blue-600 shadow-sm" 
                      : "bg-blue-50/50 text-blue-700 border-blue-200 hover:bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40",
                    BAJA: isActive 
                      ? "bg-stone-600 text-white border-stone-700 shadow-sm" 
                      : "bg-stone-50/50 text-stone-700 border-stone-200 hover:bg-stone-100 dark:bg-stone-800/30 dark:text-stone-400 dark:border-stone-700/40",
                  };

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={[
                        "py-2 rounded-xl text-xs font-bold border transition duration-200 text-center cursor-pointer",
                        stylesMap[p]
                      ].join(" ")}
                    >
                      {p === "ALTA" ? "🔴 Alta" : p === "MEDIA" ? "🔵 Media" : "⚪ Baja"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkbox de completado para el modo edición */}
            {task && (
              <div className="flex items-center justify-between p-3 rounded-2xl border border-stone-200/60 bg-stone-50/40 dark:border-stone-800/60 dark:bg-stone-900/40">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-stone-900 dark:text-white">Estado de la labor</span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">¿Se completó esta actividad?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCompleted(!completed)}
                  className={[
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    completed ? "bg-agro-600" : "bg-stone-200 dark:bg-stone-700"
                  ].join(" ")}
                >
                  <span
                    className={[
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      completed ? "translate-x-5" : "translate-x-0"
                    ].join(" ")}
                  />
                </button>
              </div>
            )}

            <Textarea
              label="Detalles o Notas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucciones adicionales, insumos requeridos..."
              className="dark:bg-stone-800/80 dark:border-stone-700 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200/50 dark:border-stone-800/60">
            {task ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition duration-200 border border-transparent hover:border-red-200"
              >
                🗑️ Eliminar
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={pending}
                className="px-4 py-2 rounded-xl dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:border-stone-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="px-5 py-2 rounded-xl font-bold bg-agro-700 text-white hover:bg-agro-800 shadow"
              >
                {pending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

import { getDiaryEntry } from "@/actions/diary";
import { DiaryEditor } from "@/components/diary/DiaryEditor";
import { formatDateISO } from "@/lib/dates";

export default async function BitacoraPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const params = await searchParams;
  const dateIso = params.fecha ?? formatDateISO(new Date());
  const entry = await getDiaryEntry(dateIso);

  return (
    <div className="space-y-8">
      <header className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-2xl shadow-stone-200/30 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.32em] text-agro-700">Bitácora agrícola</p>
        <h1 className="mt-3 font-display text-5xl font-bold text-agro-900">Registra tu día con claridad</h1>
        <p className="mt-4 max-w-3xl text-xl leading-relaxed text-stone-700">
          Anota observaciones, tareas completadas y prioridades. El registro diario te ayuda a mantener un seguimiento profesional y preciso.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <DiaryEditor dateIso={dateIso} initialContent={entry?.content ?? ""} />
        </div>
        <aside className="space-y-6 rounded-[32px] border border-stone-200 bg-white/85 p-6 shadow-xl shadow-stone-200/20">
          <div>
            <h2 className="text-2xl font-semibold text-agro-900">Navegación rápida</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Usa el selector de fecha para revisar bitácoras anteriores y mantener registro de cada jornada.
            </p>
          </div>
          <div className="rounded-3xl bg-agro-50 p-5">
            <p className="text-sm uppercase tracking-[0.22em] text-stone-600">Fecha activa</p>
            <p className="mt-3 text-2xl font-semibold text-agro-900">{dateIso}</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="font-semibold text-agro-900">Consejo</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Escribe términos importantes como urgente, entrega o revisión para que el sistema destaque la prioridad de tu bitácora.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

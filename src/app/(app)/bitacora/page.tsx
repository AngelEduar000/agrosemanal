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
      <header>
        <h1 className="font-display text-4xl font-bold text-agro-900">Bitácora diaria</h1>
        <p className="mt-2 text-xl text-stone-700">
          Registre cada día lo realizado en campo y en entregas. Puede consultar días
          anteriores cambiando la fecha en la barra del navegador o usando el selector.
        </p>
      </header>

      <form method="get" className="rounded-xl border-2 border-stone-200 bg-white p-5">
        <label className="block text-lg font-semibold" htmlFor="fecha">
          Ver o editar otro día
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="fecha"
            name="fecha"
            type="date"
            defaultValue={dateIso}
            className="min-h-[3rem] flex-1 rounded-lg border-2 border-stone-300 px-4 text-lg"
          />
          <button
            type="submit"
            className="min-h-[3rem] rounded-lg bg-agro-700 px-8 text-lg font-semibold text-white hover:bg-agro-800"
          >
            Ir a esa fecha
          </button>
        </div>
      </form>

      <DiaryEditor dateIso={dateIso} initialContent={entry?.content ?? ""} />
    </div>
  );
}

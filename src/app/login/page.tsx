import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(44,85,30,0.16),_transparent_28%),_linear-gradient(to_bottom,_#f7faf3,_#e8efe7)] px-4 py-12">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/40 bg-white/80 p-10 shadow-2xl shadow-stone-200/30 backdrop-blur-xl">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-agro-700">Ingreso seguro</p>
          <h1 className="font-display text-5xl font-bold text-agro-900">Bienvenido a AgroSemanal</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-stone-600">
            Accede a tu calendario, toma notas con estilo y recibe recordatorios por correo un día antes y el mismo día de tus actividades.
          </p>
        </div>

        <div className="mt-10">
          <LoginForm urlError={params.error} />
        </div>
      </div>
    </div>
  );
}

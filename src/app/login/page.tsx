import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-agro-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border-2 border-agro-200 bg-white p-8 shadow-md">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-agro-600">
          Acceso personal
        </p>
        <h1 className="mt-2 text-center font-display text-4xl font-bold text-agro-900">
          AgroSemanal
        </h1>
        <p className="mt-4 text-center text-xl leading-relaxed text-stone-700">
          Ingrese su correo electrónico. Le enviaremos un enlace seguro para entrar, sin
          contraseña.
        </p>
        <div className="mt-8">
          <LoginForm urlError={params.error} />
        </div>
        <p className="mt-8 text-center text-base text-stone-500">
          Solo el correo autorizado puede acceder a esta aplicación.
        </p>
      </div>
    </div>
  );
}

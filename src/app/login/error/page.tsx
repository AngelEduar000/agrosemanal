import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-agro-50 px-4">
      <div className="max-w-lg rounded-2xl border-2 border-red-200 bg-white p-8 text-center shadow-md">
        <h1 className="font-display text-3xl font-bold text-red-900">No se pudo entrar</h1>
        <p className="mt-6 text-xl text-stone-700">
          El correo no está autorizado o el enlace ya no es válido. Use únicamente el correo
          registrado para esta aplicación.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-lg bg-agro-700 px-8 py-4 text-lg font-semibold text-white hover:bg-agro-800"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-agro-50 px-4">
      <div className="max-w-lg rounded-2xl border-2 border-agro-200 bg-white p-8 text-center shadow-md">
        <h1 className="font-display text-3xl font-bold text-agro-900">Revise su correo</h1>
        <p className="mt-6 text-xl leading-relaxed text-stone-700">
          Le enviamos un enlace de acceso. Abra su bandeja de entrada y haga clic en el
          mensaje para entrar a AgroSemanal.
        </p>
        <p className="mt-4 text-lg text-stone-600">
          Si no lo ve, revise la carpeta de correo no deseado. El enlace caduca en unas
          horas.
        </p>
      </div>
    </div>
  );
}

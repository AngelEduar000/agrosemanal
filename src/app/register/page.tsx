import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,99,46,0.16),_transparent_30%),_linear-gradient(to_bottom,_#f6faf3,_#e9f0ea)] px-4 py-12">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/40 bg-white/80 p-10 shadow-2xl shadow-stone-200/40 backdrop-blur-xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.28em] text-agro-700">Registro rápido</p>
        <h1 className="mt-3 text-center font-display text-5xl font-bold text-agro-900">Bienvenido a AgroSemanal</h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg leading-relaxed text-stone-600">
          Registra tu correo y un PIN seguro para acceder de inmediato a tu calendario agrícola, bitácoras y recordatorios por email.
        </p>
        <div className="mt-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

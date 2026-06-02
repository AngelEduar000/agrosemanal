"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/planificador", label: "📅 Calendario" },
  { href: "/bitacora", label: "📖 Bitácora" },
];

export function AppShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,99,46,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(72,113,58,0.16),_transparent_30%),linear-gradient(to_bottom,_#f7faf3,_#eaf0e8)] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-[1480px] gap-6 px-4 py-6 sm:px-6">
        <aside className="flex w-full max-w-[320px] flex-col gap-8 rounded-[38px] border border-white/30 bg-white/70 p-6 shadow-2xl shadow-stone-200/30 backdrop-blur-2xl">
          <div className="space-y-4">
            <div className="rounded-3xl bg-green-950/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-agro-700">AgroSemanal</p>
              <h1 className="mt-3 text-3xl font-display font-bold text-agro-900">Agenda inteligente</h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">Calendario, bitácoras y recordatorios listos para tu día.</p>
            </div>
            {userName ? (
              <div className="rounded-3xl border border-agro-100 bg-agro-50 p-5">
                <p className="text-sm uppercase tracking-[0.22em] text-stone-600">Bienvenido</p>
                <p className="mt-2 text-2xl font-semibold text-agro-900">{userName}</p>
              </div>
            ) : null}
          </div>

          <nav className="space-y-3">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "block rounded-3xl px-5 py-4 text-lg font-semibold transition",
                    active
                      ? "bg-agro-700 text-white shadow-lg shadow-agro-700/20"
                      : "border border-stone-200 bg-white text-stone-900 hover:border-agro-300 hover:bg-agro-50",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-3">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-3xl border border-stone-200 bg-white px-5 py-3 text-left text-base font-semibold text-stone-800 transition hover:bg-stone-50"
            >
              Cerrar sesión
            </button>
            <p className="text-sm leading-relaxed text-stone-600">
              Accede a tus alertas de hoy y a la bitácora desde el calendario profesional.
            </p>
          </div>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

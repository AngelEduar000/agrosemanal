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
    <div className="min-h-screen bg-gradient-to-b from-[#f7faf3] to-[#e8efe7] text-stone-950">
      <div className="mx-auto flex min-h-screen gap-0">
        <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-white/60 bg-white/70 p-5 shadow-[0_0_50px_rgba(45,61,40,0.03)] backdrop-blur-xl">
          <div className="space-y-1.5 py-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-agro-700">AgroSemanal</span>
            </div>
            <h1 className="font-display text-xl font-bold text-stone-900 leading-tight">Tu Agenda de Campo</h1>
          </div>

          {userName ? (
            <div className="rounded-2xl border border-agro-100/50 bg-agro-50/50 p-3.5 shadow-sm backdrop-blur-sm flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-agro-700 text-sm font-bold text-white shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Productor</p>
                <p className="text-xs font-bold text-agro-900 truncate" title={userName}>{userName}</p>
              </div>
            </div>
          ) : null}

          <nav className="space-y-1.5">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-xl px-4.5 py-3 text-xs font-semibold transition-all duration-300",
                    active
                      ? "bg-agro-700 text-white shadow-md shadow-agro-800/10 scale-[1.02]"
                      : "text-stone-600 hover:bg-agro-50/60 hover:text-agro-800 hover:translate-x-1",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 border-t border-stone-200/50 pt-4">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full rounded-xl border border-stone-200/60 bg-white/80 px-4 py-2.5 text-center text-xs font-bold text-stone-600 transition-all duration-200 hover:bg-red-50/60 hover:text-red-700 hover:border-red-100 hover:scale-[1.01]"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

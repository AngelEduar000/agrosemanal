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
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="mx-auto flex min-h-screen gap-0">
        <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-stone-200 bg-white p-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-agro-700">AgroSemanal</p>
            <h1 className="text-lg font-bold text-agro-900">Tu agenda</h1>
          </div>

          {userName ? (
            <div className="rounded-lg bg-agro-50 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-stone-600">Hola</p>
              <p className="text-sm font-semibold text-agro-900">{userName}</p>
            </div>
          ) : null}

          <nav className="space-y-1">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "block rounded-md px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-agro-700 text-white"
                      : "text-stone-700 hover:bg-stone-100",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 border-t border-stone-200 pt-4">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-left text-xs font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}

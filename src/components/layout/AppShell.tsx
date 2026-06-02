"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/pedidos", label: "Pedidos" },
  { href: "/planificador", label: "Planificador semanal" },
  { href: "/bitacora", label: "Bitácora diaria" },
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
    <div className="min-h-screen bg-agro-50">
      <header className="border-b-2 border-agro-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-agro-600">
              Gestión agrícola personal
            </p>
            <h1 className="font-display text-3xl font-bold text-agro-900">AgroSemanal</h1>
            {userName && (
              <p className="mt-1 text-lg text-stone-600">Bienvenido, {userName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="self-start rounded-lg border-2 border-stone-300 px-5 py-2 text-lg font-medium text-stone-700 hover:bg-stone-50"
          >
            Cerrar sesión
          </button>
        </div>
        <nav
          className="mx-auto max-w-5xl px-4 pb-4"
          aria-label="Menú principal"
        >
          <ul className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href} className="flex-1">
                  <Link
                    href={item.href}
                    className={[
                      "block rounded-lg border-2 px-4 py-4 text-center text-lg font-semibold transition-colors",
                      active
                        ? "border-agro-700 bg-agro-700 text-white"
                        : "border-agro-300 bg-white text-agro-800 hover:bg-agro-100",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-5xl px-4 pb-10 text-center text-base text-stone-500">
        AgroSemanal · Uso personal · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

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
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const isDarkTheme =
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkTheme);
    if (isDarkTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7faf3] to-[#e8efe7] dark:from-[#0d120a] dark:to-[#070905] text-stone-950 dark:text-stone-50 transition-colors duration-300">
      <div className="mx-auto flex min-h-screen gap-0">
        <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-white/60 bg-white/70 dark:border-white/10 dark:bg-stone-900/60 p-5 shadow-[0_0_50px_rgba(45,61,40,0.03)] dark:shadow-black/20 backdrop-blur-xl">
          <div className="space-y-1.5 py-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-agro-700 dark:text-agro-400">AgroSemanal</span>
            </div>
            <h1 className="font-display text-xl font-bold text-stone-900 dark:text-white leading-tight">Tu Agenda de Campo</h1>
          </div>

          {userName ? (
            <div className="rounded-2xl border border-agro-100/50 bg-agro-50/50 dark:border-agro-900/20 dark:bg-agro-950/20 p-3.5 shadow-sm backdrop-blur-sm flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-agro-700 text-sm font-bold text-white shadow-sm dark:bg-agro-600">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold">Productor</p>
                <p className="text-xs font-bold text-agro-900 dark:text-agro-400 truncate" title={userName}>{userName}</p>
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
                      ? "bg-agro-700 text-white dark:bg-agro-600 shadow-md shadow-agro-800/10 scale-[1.02]"
                      : "text-stone-600 dark:text-stone-300 hover:bg-agro-50/60 dark:hover:bg-agro-950/20 hover:text-agro-800 dark:hover:text-agro-400 hover:translate-x-1",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 border-t border-stone-200/50 dark:border-stone-800/60 pt-4">
            {/* Switch Toggler del Tema */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-xl border border-stone-200/60 bg-white/80 dark:border-stone-700/60 dark:bg-stone-850 px-4 py-2.5 text-xs font-semibold text-stone-650 dark:text-stone-300 transition-all duration-200 hover:bg-stone-50 dark:hover:bg-stone-800/40 cursor-pointer shadow-sm hover:shadow"
            >
              <span className="flex items-center gap-2">
                <span>{isDark ? "☀️" : "🌙"}</span>
                <span>{isDark ? "Modo Claro" : "Modo Oscuro"}</span>
              </span>
              <span className="text-[9px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">Alternar</span>
            </button>

            {/* Botón de Cerrar Sesión */}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full rounded-xl border border-stone-200/60 bg-white/80 dark:border-stone-700/60 dark:bg-stone-850 px-4 py-2.5 text-center text-xs font-bold text-stone-600 dark:text-stone-300 transition-all duration-200 hover:bg-red-50/60 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-450 hover:border-red-100 dark:hover:border-red-900/30 hover:scale-[1.01] cursor-pointer"
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

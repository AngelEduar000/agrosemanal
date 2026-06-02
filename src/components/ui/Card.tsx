import { ReactNode } from "react";

export function Card({
  children,
  className = "",
  title,
  subtitle,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <section
      className={[
        "rounded-xl border-2 border-stone-200 bg-white p-6 shadow-sm",
        className,
      ].join(" ")}
    >
      {(title || subtitle) && (
        <header className="mb-5 border-b border-stone-100 pb-4">
          {title && (
            <h2 className="font-display text-2xl font-semibold text-agro-800">{title}</h2>
          )}
          {subtitle && <p className="mt-1 text-lg text-stone-600">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

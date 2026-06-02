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
        "rounded-[32px] border border-white/40 bg-white/70 p-6 shadow-[0_20px_80px_rgba(45,61,40,0.08)] backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      {(title || subtitle) && (
        <header className="mb-5 border-b border-stone-100/80 pb-4">
          {title && (
            <h2 className="font-display text-2xl font-semibold text-agro-900">{title}</h2>
          )}
          {subtitle && <p className="mt-1 text-lg text-stone-600">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

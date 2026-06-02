import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-agro-700 text-white hover:bg-agro-800 focus:ring-agro-500 border border-agro-800",
  secondary:
    "bg-stone-100 text-stone-900 hover:bg-stone-200 focus:ring-stone-400 border border-stone-300",
  outline:
    "bg-white text-agro-800 hover:bg-agro-50 focus:ring-agro-400 border-2 border-agro-600",
  danger:
    "bg-red-800 text-white hover:bg-red-900 focus:ring-red-400 border border-red-900",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", fullWidth, children, ...props }, ref) => (
    <button
      ref={ref}
      className={[
        "inline-flex min-h-[3rem] items-center justify-center rounded-lg px-6 py-3 text-lg font-semibold",
        "transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        fullWidth ? "w-full" : "",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";

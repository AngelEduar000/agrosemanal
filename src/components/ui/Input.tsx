import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id, className = "", ...props }, ref) => {
    const inputId = id ?? label.replace(/\s/g, "-").toLowerCase();
    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-lg font-semibold text-stone-900">
          {label}
        </label>
        {hint && <p className="text-base text-stone-600">{hint}</p>}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full min-h-[3rem] rounded-3xl border border-stone-300 bg-white/85 px-4 py-3 text-lg text-stone-900 shadow-sm shadow-stone-200/20",
            "placeholder:text-stone-400 focus:border-agro-600 focus:outline-none focus:ring-4 focus:ring-agro-200/70",
            error ? "border-red-600" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {error && <p className="text-base font-medium text-red-700" role="alert">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

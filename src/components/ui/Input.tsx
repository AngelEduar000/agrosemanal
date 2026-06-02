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
      <div className="space-y-1">
        <label htmlFor={inputId} className="block text-sm font-semibold text-stone-900">
          {label}
        </label>
        {hint && <p className="text-xs text-stone-600">{hint}</p>}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full min-h-10 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm",
            "placeholder:text-stone-400 focus:border-agro-600 focus:outline-none focus:ring-2 focus:ring-agro-200",
            error ? "border-red-600" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {error && <p className="text-sm font-medium text-red-700" role="alert">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

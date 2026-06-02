import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, options, id, className = "", ...props }, ref) => {
    const selectId = id ?? label.replace(/\s/g, "-").toLowerCase();
    return (
      <div className="space-y-2">
        <label htmlFor={selectId} className="block text-lg font-semibold text-stone-900">
          {label}
        </label>
        {hint && <p className="text-base text-stone-600">{hint}</p>}
        <select
          ref={ref}
          id={selectId}
          className={[
            "w-full min-h-[3rem] rounded-lg border-2 border-stone-300 bg-white px-4 py-3 text-lg text-stone-900",
            "focus:border-agro-600 focus:outline-none focus:ring-4 focus:ring-agro-200",
            className,
          ].join(" ")}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";

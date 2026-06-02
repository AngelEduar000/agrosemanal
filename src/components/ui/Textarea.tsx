import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, id, className = "", ...props }, ref) => {
    const areaId = id ?? label.replace(/\s/g, "-").toLowerCase();
    return (
      <div className="space-y-1">
        <label htmlFor={areaId} className="block text-sm font-semibold text-stone-900">
          {label}
        </label>
        {hint && <p className="text-xs text-stone-600">{hint}</p>}
        <textarea
          ref={ref}
          id={areaId}
          rows={4}
          className={[
            "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm leading-relaxed text-stone-900 shadow-sm",
            "placeholder:text-stone-400 focus:border-agro-600 focus:outline-none focus:ring-2 focus:ring-agro-200",
            className,
          ].join(" ")}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

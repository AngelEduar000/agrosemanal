import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, id, className = "", ...props }, ref) => {
    const areaId = id ?? label.replace(/\s/g, "-").toLowerCase();
    return (
      <div className="space-y-0.5">
        <label htmlFor={areaId} className="block text-xs font-semibold text-stone-900">
          {label}
        </label>
        {hint && <p className="text-xs text-stone-500">{hint}</p>}
        <textarea
          ref={ref}
          id={areaId}
          rows={3}
          className={[
            "w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs leading-relaxed text-stone-900",
            "placeholder:text-stone-400 focus:border-agro-600 focus:outline-none focus:ring-1 focus:ring-agro-200 resize-none",
            className,
          ].join(" ")}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

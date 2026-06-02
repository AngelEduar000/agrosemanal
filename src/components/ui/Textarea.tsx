import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, id, className = "", ...props }, ref) => {
    const areaId = id ?? label.replace(/\s/g, "-").toLowerCase();
    return (
      <div className="space-y-2">
        <label htmlFor={areaId} className="block text-lg font-semibold text-stone-900">
          {label}
        </label>
        {hint && <p className="text-base text-stone-600">{hint}</p>}
        <textarea
          ref={ref}
          id={areaId}
          rows={6}
          className={[
            "w-full rounded-lg border-2 border-stone-300 bg-white px-4 py-3 text-lg leading-relaxed text-stone-900",
            "placeholder:text-stone-400 focus:border-agro-600 focus:outline-none focus:ring-4 focus:ring-agro-200",
            className,
          ].join(" ")}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

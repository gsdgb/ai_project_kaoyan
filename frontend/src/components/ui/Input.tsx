import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, icon, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-neutral-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white",
            "text-sm text-neutral-800 placeholder:text-neutral-400",
            "transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
            "disabled:bg-neutral-50 disabled:text-neutral-400",
            error && "border-danger-500 focus:ring-danger-500/20 focus:border-danger-500",
            icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="mt-1 text-xs text-neutral-400">{hint}</p>
      )}
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";
export default Input;

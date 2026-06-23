import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm",
  secondary:
    "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300",
  outline:
    "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100",
  ghost: "text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200",
  danger: "bg-danger-500 text-white hover:bg-danger-600 shadow-sm",
  success: "bg-success-500 text-white hover:bg-success-600 shadow-sm",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2.5 rounded-lg",
  icon: "h-9 w-9 p-0 rounded-lg justify-center",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
        "disabled:opacity-45 disabled:pointer-events-none",
        "cursor-pointer select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
);

Button.displayName = "Button";
export default Button;

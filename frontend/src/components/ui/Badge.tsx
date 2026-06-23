import { cn } from "@/lib/utils";

const variants = {
  default: "bg-neutral-100 text-neutral-600",
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
};

const sizes = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
};

interface BadgeProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

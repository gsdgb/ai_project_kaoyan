import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddings = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6 sm:p-8",
};

export function Card({
  className,
  children,
  hover = false,
  padding = "md",
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-neutral-200/80 shadow-xs",
        hover && "hover:shadow-md hover:border-neutral-300 transition-shadow cursor-pointer",
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className={cn("text-base font-semibold text-neutral-800", className)}>
      {children}
    </h3>
  );
}

export default Card;

import { cn } from "@/lib/utils";
import { type LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <Icon size={24} className="text-neutral-400" />
      </div>
      <h3 className="text-base font-medium text-neutral-700 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-400 max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}

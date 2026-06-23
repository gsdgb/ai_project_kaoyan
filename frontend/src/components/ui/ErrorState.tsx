import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "./Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "加载失败，请稍后重试",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-danger-50 flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-danger-500" />
      </div>
      <h3 className="text-base font-medium text-neutral-700 mb-1.5">
        出错了
      </h3>
      <p className="text-sm text-neutral-400 max-w-sm mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw size={14} />
          重试
        </Button>
      )}
    </div>
  );
}

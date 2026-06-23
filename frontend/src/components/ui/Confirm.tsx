import { Modal } from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "确认",
  variant = "danger",
  loading,
}: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="h-12 w-12 rounded-full bg-danger-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-danger-500" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">
          {title}
        </h3>
        <p className="text-sm text-neutral-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  size = "md",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-fade-in" />

      {/* panel */}
      <div
        className={cn(
          "relative w-full bg-white rounded-xl shadow-xl animate-slide-up",
          sizeMap[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-800">{title}</h2>
            <button
              onClick={onClose}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

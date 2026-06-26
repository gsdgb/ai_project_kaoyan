import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  FolderOpen,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";

const navItems = [
  {
    label: "对话",
    icon: MessageSquare,
    path: "/",
    exact: true,
  },
  {
    label: "文件管理",
    icon: FolderOpen,
    path: "/files",
  },
  {
    label: "统计分析",
    icon: BarChart3,
    path: "/stats",
    disabled: true,
  },
  {
    label: "文档",
    icon: FileText,
    path: "/docs",
    disabled: true,
  },
  {
    label: "设置",
    icon: Settings,
    path: "/settings",
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { pathname } = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-60",
          "bg-white border-r border-neutral-200/60",
          "flex flex-col",
          "transition-transform duration-200",
          "lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.path
              : pathname.startsWith(item.path) && item.path !== "/";

            return (
              <Link
                key={item.path}
                to={item.disabled ? "#" : item.path}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : item.disabled
                    ? "text-neutral-300 cursor-not-allowed"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                )}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.disabled && (
                  <span className="ml-auto text-[10px] bg-neutral-100 text-neutral-400 px-1.5 py-0.5 rounded-full">
                    即将推出
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-1">
            <div className="h-2 w-2 rounded-full bg-success-500" />
            <span className="text-xs text-neutral-400">API 服务运行中</span>
          </div>
        </div>
      </aside>
    </>
  );
}

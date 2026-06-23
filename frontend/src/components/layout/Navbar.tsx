import { useAuthStore } from "@/stores/authStore";
import { LogOut, Menu, Search, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/80 backdrop-blur-lg border-b border-neutral-200/60">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <span className="font-semibold text-neutral-800 text-sm hidden sm:block">
              AI 学习助手
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-6">
            <Link
              to="/"
              className="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              对话
            </Link>
            <Link
              to="/files"
              className="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              文件
            </Link>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-sm text-neutral-700 hidden sm:block max-w-[100px] truncate">
                {user?.username || "用户"}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-neutral-200 shadow-lg py-1 animate-fade-in z-50">
                <div className="px-4 py-2.5 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {user?.email || "未设置邮箱"}
                  </p>
                </div>
                <button
                  onClick={() => { navigate("/settings"); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <Settings size={16} />
                  设置
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger-500 hover:bg-danger-50 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

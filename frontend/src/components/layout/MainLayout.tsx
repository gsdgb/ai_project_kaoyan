import { useState, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { PageSpinner } from "@/components/ui/Spinner";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Suspense fallback={<PageSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

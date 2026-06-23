import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo centered */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg font-bold">AI</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-800">AI 学习助手</h1>
          <p className="text-sm text-neutral-400 mt-1">智能对话，高效学习</p>
        </div>

        <Outlet />
      </div>
    </div>
  );
}

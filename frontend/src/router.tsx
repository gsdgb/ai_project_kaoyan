import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ConversationListPage = lazy(
  () => import("@/pages/ConversationListPage")
);
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const FilesPage = lazy(() => import("@/pages/FilesPage"));
const RAGPage = lazy(() => import("@/pages/RAGPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

// Auth guard
function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <RedirectIfAuth>
        <AuthLayout />
      </RedirectIfAuth>
    ),
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: "/register",
    element: (
      <RedirectIfAuth>
        <AuthLayout />
      </RedirectIfAuth>
    ),
    children: [{ index: true, element: <RegisterPage /> }],
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <ConversationListPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "chat/:id", element: <ChatPage /> },
      { path: "files", element: <FilesPage /> },
      { path: "rag", element: <RAGPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

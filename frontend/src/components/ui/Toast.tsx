import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "0.75rem",
          padding: "12px 16px",
          fontSize: "0.875rem",
          fontWeight: 500,
          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.12)",
        },
        success: {
          iconTheme: { primary: "#10b981", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        },
      }}
    />
  );
}

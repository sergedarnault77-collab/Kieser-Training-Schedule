import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

const RootLayout = () => (
  <div className="min-h-screen bg-slate-950">
    <Outlet />
    <Toaster 
      position="top-center" 
      toastOptions={{
        style: {
          background: '#1e293b',
          border: '1px solid #334155',
          color: '#fff',
        },
      }}
    />
  </div>
);

export const Route = createRootRoute({ component: RootLayout });

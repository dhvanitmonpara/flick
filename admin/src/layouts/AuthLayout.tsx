import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

function AuthLayout() {
  return (
      <main
        className="flex items-center justify-center bg-zinc-900 h-screen p-8 sm:px-12 g:px-16 lg:py-12"
      >
          <Outlet />
          <Toaster />
      </main>
  );
}

export default AuthLayout;

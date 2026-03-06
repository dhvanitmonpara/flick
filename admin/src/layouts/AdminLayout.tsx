import DashboardTab from "@/components/general/DashboardTab";
import { tabs } from "@/constants/tabs";
import { authClient } from "@/lib/auth-client";
import { hasAdminAccess } from "@/lib/roles";
import useProfileStore from "@/store/profileStore";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Menu, X } from "lucide-react";

function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setProfile, removeProfile } = useProfileStore()
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (session?.user && hasAdminAccess(session.user.role)) {
      setProfile({ ...session.user, id: session.user.id } as any);
    }
  }, [session, setProfile])

  useEffect(() => {
    if (isPending) return;

    let cancelled = false;

    const validateSession = async () => {
      if (!session?.user) {
        const freshSession = await authClient.getSession();
        const freshUser = freshSession?.data?.user;

        if (cancelled) return;

        if (!freshUser) {
          navigate("/auth/signin", { replace: true });
          return;
        }

        if (!hasAdminAccess(freshUser.role)) {
          removeProfile();
          await authClient.signOut();
          toast.error("Unauthorized. Admin access only.");
          navigate("/auth/signin", { replace: true });
          return;
        }

        setProfile({ ...freshUser, id: freshUser.id } as any);
        return;
      }

      if (!hasAdminAccess(session.user.role)) {
        removeProfile();
        await authClient.signOut();
        toast.error("Unauthorized. Admin access only.");
        navigate("/auth/signin", { replace: true });
      }
    };

    validateSession();

    return () => {
      cancelled = true;
    };
  }, [navigate, session, isPending, removeProfile, setProfile]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  if (isPending) {
    return <div className="w-screen h-screen flex justify-center items-center bg-zinc-900 text-white">Loading...</div>
  }

  return (
    <main className="w-screen h-screen overflow-x-hidden flex flex-col md:grid md:grid-cols-12 bg-zinc-800/10 text-zinc-100">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-700/60 bg-zinc-900 z-40">
        <div className="flex items-center gap-2">
           <p className="text-lg font-semibold text-zinc-100 leading-tight">Flick Admin</p>
        </div>
        <button onClick={() => setMobileMenuOpen(true)}>
          <Menu className="w-6 h-6 text-zinc-100" />
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-auto md:col-span-3 lg:col-span-2 p-2 md:p-4 bg-zinc-900 md:bg-transparent ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} h-screen`}>
        <div className="h-full rounded-2xl md:border border-zinc-700/60 bg-zinc-900/50 px-3 py-4 flex flex-col relative">
          <button className="md:hidden absolute top-4 right-4 text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
          
          <div className="px-2 pb-4 border-b border-zinc-800 shrink-0 mt-4 md:mt-0">
            <p className="text-xs uppercase tracking-[0.2em] mb-8 text-zinc-500 hidden md:block">Flick</p>
            <p className="text-lg font-semibold text-zinc-100 leading-tight">Admin Panel</p>
            <p className="text-xs text-zinc-400 mt-1 truncate">
              {session?.user?.email}
            </p>
          </div>

          <div className="mt-4 space-y-1 overflow-y-auto shrink-0 flex-1">
            {tabs.map(({ name, path, icon }) => (
              <DashboardTab to={path} key={name}>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/70 text-zinc-300 group-hover:text-zinc-100">
                  {icon}
                </span>
                <span className="font-medium">{name}</span>
              </DashboardTab>
            ))}
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 md:col-span-9 lg:col-span-10 p-2 md:py-4 md:pr-4 h-[calc(100vh-65px)] md:h-screen overflow-y-auto">
        <div className="border border-zinc-700/60 bg-zinc-900/50 rounded-md h-full overflow-x-hidden">
          <Outlet />
        </div>
      </div>
      <Toaster />
    </main>
  );
}

export default AdminLayout;

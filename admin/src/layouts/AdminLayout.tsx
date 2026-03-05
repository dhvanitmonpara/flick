import DashboardTab from "@/components/general/DashboardTab";
import { tabs } from "@/constants/tabs";
import { authClient } from "@/lib/auth-client";
import { hasAdminAccess } from "@/lib/roles";
import useProfileStore from "@/store/profileStore";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { toast } from "sonner";

function AdminLayout() {

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

  if (isPending) {
    return <div className="w-screen h-screen flex justify-center items-center bg-zinc-900 text-white">Loading...</div>
  }

  return (
    <main className="w-screen h-screen overflow-x-hidden grid grid-cols-12 bg-zinc-800/10 text-zinc-100">
      <aside className="h-screen col-span-12 md:col-span-3 lg:col-span-2 p-2 md:p-4">
        <div className="h-full rounded-2xl border border-zinc-700/60 bg-zinc-900/50 px-3 py-4">
          <div className="px-2 pb-4 border-b border-zinc-800">
            <p className="text-xs uppercase tracking-[0.2em] mb-8 text-zinc-500">Flick</p>
            <p className="text-lg font-semibold text-zinc-100 leading-tight">Admin Panel</p>
            <p className="text-xs text-zinc-400 mt-1 truncate">
              {session?.user?.email}
            </p>
          </div>

          <div className="mt-4 space-y-1">
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
      <div className="col-span-12 md:col-span-9 lg:col-span-10 py-2 pr-2 md:py-4 md:pr-4 h-screen overflow-y-auto">
        <div className="border border-zinc-700/60 bg-zinc-900/50 rounded-md h-full">
          <Outlet />
        </div>
      </div>
      <Toaster />
    </main>
  );
}

export default AdminLayout;

import DashboardTab from "@/components/general/DashboardTab";
import { tabs } from "@/constants/tabs";
import useProfileStore from "@/store/profileStore";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { authClient } from "@/lib/auth-client";

function AdminLayout() {

  const { profile, setProfile } = useProfileStore()
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (session?.user && session.user.role === 'admin') {
      setProfile({ ...session.user, _id: session.user.id } as any);
    }
  }, [session, setProfile])

  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate("/auth/signin");
    }
  }, [navigate, session, isPending]);

  if (isPending) {
    return <div className="w-screen h-screen flex justify-center items-center bg-zinc-900 text-white">Loading...</div>
  }

  return (
    <main className="w-screen h-screen overflow-x-hidden grid grid-cols-12 bg-zinc-900 text-zinc-100">
      <div className="bg-zinc-800 h-screen py-8 px-4 col-span-12 md:col-span-3 lg:col-span-2 flex flex-col gap-1">
        {tabs.map(({ name, path, icon }) => (
          <DashboardTab to={path} key={name}>
            {icon}
            <span>{name}</span>
          </DashboardTab>
        ))}
      </div>
      <Outlet />
      <Toaster />
    </main>
  );
}

export default AdminLayout;
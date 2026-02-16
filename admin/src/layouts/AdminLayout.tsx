import DashboardTab from "@/components/general/DashboardTab";
import { tabs } from "@/constants/tabs";
import useProfileStore from "@/store/profileStore";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";

function AdminLayout() {

  const { profile } = useProfileStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!profile._id) {
      navigate("/auth/signin");
    }
  }, [navigate, profile._id]);

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
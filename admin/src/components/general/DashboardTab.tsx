import React from "react";
import { NavLink } from "react-router-dom";

function DashboardTab({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative w-full rounded-xl px-3 py-2.5 flex items-center gap-3 text-sm transition-all ${
          isActive
            ? "bg-zinc-700/80 text-zinc-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
            : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default DashboardTab;

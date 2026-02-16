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
    className={({isActive}) => (`${isActive ? "font-semibold text-green-500" : "text-zinc-400 hover:text-zinc-50"} text-lg px-4 py-2 w-full rounded-md flex space-x-2 justify-start items-center`)}
    >
      {children}
    </NavLink>
  );
}

export default DashboardTab;

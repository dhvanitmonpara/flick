import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { toast } from "sonner";
import { User } from "@/types/User";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { HiDotsHorizontal } from "react-icons/hi";
import { TableWrapper, ColumnDefinition } from "@/components/general/TableWrapper";
import { http } from "@/services/http";

interface UserTableProps {
  data: User[];
  setData: React.Dispatch<React.SetStateAction<User[]>>;
}

function addDays(isoString: string, days: number = 3): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) throw new Error("Invalid ISO date string");

  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export function UserTable({ data, setData }: UserTableProps) {
  const handleAction = async (userId: string, action: "block" | "suspend" | "unblock") => {
    try {
      const url = `/users/${userId}/moderation-state`;
      const payload: { blocked: boolean; suspension?: { ends: string; reason: string } } = {
        blocked: action !== "unblock",
      };

      if (action === "suspend") {
        payload.suspension = {
          ends: addDays(new Date().toISOString(), 3),
          reason: "Violation of community guidelines",
        };
      }

      const res = await http.put(url, payload);
      if (res.status !== 200) {
        toast.error(`Failed to ${action} user.`);
        return;
      }

      setData((prev) =>
        prev.map((user) =>
          user.id !== userId
            ? user
            : {
              ...user,
              isBlocked: action === "block" ? true : action === "unblock" ? false : user.isBlocked,
              suspension:
                action === "suspend"
                  ? {
                    ends: new Date(new Date(payload.suspension?.ends ?? "").toUTCString()),
                    reason: payload.suspension?.reason ?? user.suspension?.reason ?? null,
                    howManyTimes: user.suspension?.howManyTimes ?? 0,
                  }
                  : user.suspension,
            }
        )
      );
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const columns: ColumnDefinition<User>[] = [
    {
      key: "username",
      label: "Username",
    },
    {
      key: "college.profile",
      label: "Profile",
      render: (user) => (
        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              onClick={() => {
                const profileUrl = typeof user.college === "object" ? user.college?.profile : "";
                navigator.clipboard.writeText(profileUrl ?? "");
                toast.success("Copied to clipboard");
              }}
              className="text-blue-500 underline cursor-pointer"
            >
              View
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-48 p-2 bg-zinc-800 border-zinc-800">
            <img
              src={(typeof user.college === "object") && user.college?.profile || ""}
              alt="Profile"
              className="w-full h-40 object-cover rounded"
            />
          </HoverCardContent>
        </HoverCard>
      ),
    },
    {
      key: "branch",
      label: "Branch",
    },
    {
      key: "isBlocked",
      label: "Blocked",
      render: (user) => (user.isBlocked ? "Yes" : "No"),
    },
    {
      key: "suspension.ends",
      label: "Suspension",
      render: (user) =>
        user.suspension?.ends
          ? new Date(user.suspension.ends).toDateString()
          : "N/A",
    },
  ];

  const renderActions = (user: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm text-zinc-100 bg-zinc-700 rounded-md">
          <HiDotsHorizontal />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-zinc-700 text-zinc-100 border-zinc-700" align="end">
        <DropdownMenuItem className="cursor-pointer" onClick={() => handleAction(user.id, "block")}>
          Ban User
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => handleAction(user.id, "unblock")}>
          Unban User
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => handleAction(user.id, "suspend")}>
          Suspend User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <TableWrapper<User>
      data={data}
      columns={columns}
      renderActions={renderActions}
      tableClassName=""
      rowClassName="border-zinc-800"
    />
  );
}

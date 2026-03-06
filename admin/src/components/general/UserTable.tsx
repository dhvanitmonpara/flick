import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { toast } from "sonner";
import { User } from "@/types/User";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { HiDotsHorizontal } from "react-icons/hi";
import { TableWrapper, ColumnDefinition } from "@/components/general/TableWrapper";
import { http } from "@/services/http";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { Badge } from "../ui/badge";

interface UserTableProps {
  data: User[];
  setData: React.Dispatch<React.SetStateAction<User[]>>;
}

type UserAction = "block" | "suspend" | "unblock" | "removeSuspension";

function addDays(isoString: string, days: number = 3): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) throw new Error("Invalid ISO date string");

  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function getSuspensionEndDate(ends: string | Date | null | undefined): Date | null {
  if (!ends) return null;
  const parsed = new Date(ends);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function hasActiveSuspension(user: User): boolean {
  const endDate = getSuspensionEndDate(user.suspension?.ends);
  return Boolean(endDate && endDate.getTime() > Date.now());
}

export function UserTable({ data, setData }: UserTableProps) {
  const [suspensionDialogUserId, setSuspensionDialogUserId] = useState<string | null>(null);
  const [suspensionDays, setSuspensionDays] = useState("3");
  const [suspensionReason, setSuspensionReason] = useState("Violation of community guidelines");
  const [isSubmittingSuspension, setIsSubmittingSuspension] = useState(false);
  const [activeAction, setActiveAction] = useState<{ userId: string; action: UserAction } | null>(null);

  const handleAction = async (
    userId: string,
    action: UserAction,
    suspensionInput?: { days: number; reason: string }
  ) => {
    try {
      setActiveAction({ userId, action });
      const url = `/users/${userId}/moderation-state`;
      const payload: { blocked: boolean; suspension?: { ends: string; reason: string } } = {
        blocked: action !== "unblock" && action !== "removeSuspension",
      };

      if (action === "suspend") {
        if (!suspensionInput) {
          toast.error("Suspension details are required.");
          return;
        }
        payload.suspension = {
          ends: addDays(new Date().toISOString(), suspensionInput.days),
          reason: suspensionInput.reason,
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
              isBlocked: action === "block" || action === "suspend",
              suspension:
                action === "suspend"
                  ? {
                    ends: payload.suspension?.ends ?? null,
                    reason: payload.suspension?.reason ?? null,
                    howManyTimes: user.suspension?.howManyTimes ?? 0,
                  }
                  : action === "block" || action === "unblock" || action === "removeSuspension"
                    ? null
                    : user.suspension,
            }
        )
      );
      toast.success(
        action === "suspend"
          ? "User suspended successfully."
          : action === "removeSuspension"
            ? "User suspension removed successfully."
            : action === "block"
              ? "User banned successfully."
              : "User unbanned successfully."
      );
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      toast.error(
        action === "removeSuspension"
          ? "Failed to remove suspension."
          : `Failed to ${action} user.`
      );
    } finally {
      setActiveAction(null);
    }
  };

  const openSuspensionDialog = (userId: string) => {
    setSuspensionDialogUserId(userId);
  };

  const onConfirmSuspension = async () => {
    if (!suspensionDialogUserId) return;

    const days = Number.parseInt(suspensionDays, 10);
    if (!Number.isInteger(days) || days <= 0) {
      toast.error("Please enter a valid number of days.");
      return;
    }

    const reason = suspensionReason.trim();
    if (!reason) {
      toast.error("Suspension reason is required.");
      return;
    }

    try {
      setIsSubmittingSuspension(true);
      await handleAction(suspensionDialogUserId, "suspend", { days, reason });
      setSuspensionDialogUserId(null);
    } finally {
      setIsSubmittingSuspension(false);
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
      render: (user) => {
        const profileUrl = typeof user.college === "object" ? user.college?.profile : "";

        if (!profileUrl) {
          return <span className="text-zinc-500">N/A</span>;
        }

        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(profileUrl);
                  toast.success("Copied to clipboard");
                }}
                className="text-blue-500 underline cursor-pointer"
              >
                View
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-48 p-2 bg-zinc-800 border-zinc-800">
              <img
                src={profileUrl}
                alt="Profile"
                className="w-full h-40 object-cover rounded"
              />
            </HoverCardContent>
          </HoverCard>
        );
      },
    },
    {
      key: "branch",
      label: "Branch",
    },
    {
      key: "isBlocked",
      label: "Blocked",
      render: (user) => (
        user.isBlocked
          ? <Badge variant="destructive">Yes</Badge>
          : <Badge variant="secondary">No</Badge>
      ),
    },
    {
      key: "suspension.ends",
      label: "Suspension",
      render: (user) => {
        const endDate = getSuspensionEndDate(user.suspension?.ends);
        if (!endDate) return <span className="text-zinc-500">N/A</span>;

        const active = endDate.getTime() > Date.now();
        return (
          <span className={active ? "text-yellow-400" : "text-zinc-400"}>
            {active ? "Active till " : "Expired on "}
            {endDate.toDateString()}
          </span>
        );
      },
    },
  ];

  const renderActions = (user: User) => {
    const isBusy = activeAction?.userId === user.id;
    const activeSuspension = hasActiveSuspension(user);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm text-zinc-100 bg-zinc-700 rounded-md disabled:opacity-50"
            disabled={isBusy}
          >
            <HiDotsHorizontal />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-700 text-zinc-100 border-zinc-700" align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isBusy || user.isBlocked}
            onClick={() => handleAction(user.id, "block")}
          >
            Ban User
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isBusy || !user.isBlocked}
            onClick={() => handleAction(user.id, "unblock")}
          >
            Unban User
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isBusy || user.isBlocked || activeSuspension}
            onClick={() => openSuspensionDialog(user.id)}
          >
            Suspend User
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isBusy || !activeSuspension}
            onClick={() => handleAction(user.id, "removeSuspension")}
          >
            Remove Suspension
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <>
      <TableWrapper<User>
        data={data}
        columns={columns}
        renderActions={renderActions}
        tableClassName=""
        rowClassName="border-zinc-800"
      />

      <Dialog open={Boolean(suspensionDialogUserId)} onOpenChange={(open) => !open && setSuspensionDialogUserId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Set suspension duration and reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-zinc-300">Number of days</p>
              <Input
                type="number"
                min={1}
                value={suspensionDays}
                onChange={(e) => setSuspensionDays(e.target.value)}
                className="border-zinc-700 bg-zinc-800 focus:border-zinc-200 focus-visible:ring-zinc-200"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-zinc-300">Reason</p>
              <Textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                className="border-zinc-700 bg-zinc-800 focus:border-zinc-200 focus-visible:ring-zinc-200"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSuspensionDialogUserId(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onConfirmSuspension} disabled={isSubmittingSuspension}>
              {isSubmittingSuspension ? "Suspending..." : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

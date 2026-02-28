import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { HiDotsHorizontal } from "react-icons/hi";
import { toast } from "sonner";
import useReportStore from "@/store/ReportStore";
import { ReportedPost } from "@/types/ReportedPost";
import { TableWrapper, ColumnDefinition } from "@/components/general/TableWrapper";
import { http, rootHttp } from "@/services/http";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

type actionType =
  | "BAN_POST"
  | "UNBAN_POST"
  | "SHADOW_BAN_POST"
  | "SHADOW_UNBAN_POST"
  | "BAN_REPORTER"
  | "UNBAN_REPORTER"
  | "SUSPEND_REPORTER"
  | "UNSUSPEND_REPORTER"
  | "BAN_USER"
  | "UNBAN_USER"
  | "SUSPEND_USER"
  | "UNSUSPEND_USER"
  | "IGNORE_REPORT"
  | "MARK_PENDING"
  | "UNDO_ALL_ACTIONS";

function addDays(isoString: string, days = 3): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) throw new Error("Invalid ISO date string");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

const ReportedPostTable = ({ reports, onRefresh }: { reports: ReportedPost[]; onRefresh?: () => Promise<void> | void }) => {
  const { updateReportStatus } = useReportStore();
  const [pendingSuspension, setPendingSuspension] = useState<{
    action: "SUSPEND_USER" | "SUSPEND_REPORTER";
    reportId: string;
    targetId: string;
    targetType: "Post" | "Comment";
    reporterId: string;
    posterId: string;
  } | null>(null);
  const [suspensionDays, setSuspensionDays] = useState("3");
  const [suspensionReason, setSuspensionReason] = useState("Violation of community guidelines");
  const [isSuspending, setIsSuspending] = useState(false);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  const hasActiveSuspension = (ends?: string | null) => {
    if (!ends) return false;
    const date = new Date(ends);
    if (Number.isNaN(date.getTime())) return false;
    return date.getTime() > Date.now();
  };

  const updateContentModerationState = async (
    targetType: "Post" | "Comment",
    targetId: string,
    state: "active" | "banned" | "shadow_banned"
  ) => {
    if (targetType === "Comment" && state === "shadow_banned") {
      throw new Error("Shadow ban is only supported for posts.");
    }

    const endpoint =
      targetType === "Comment"
        ? `/moderation/comments/${targetId}/moderation-state`
        : `/moderation/posts/${targetId}/moderation-state`;

    await rootHttp.put(endpoint, { state });
  };

  const updateUserModerationState = async (
    userId: string,
    payload: { blocked: boolean; suspension?: { ends: string; reason: string } }
  ) => {
    await http.put(`/users/${userId}/moderation-state`, payload);
  };

  const updateSingleReportStatus = async (
    reportId: string,
    status: "pending" | "resolved" | "ignored"
  ) => {
    await rootHttp.patch(`/reports/${reportId}`, { status });
  };

  const handleAction = async (
    action: actionType,
    reportId: string,
    targetId: string,
    targetType: "Post" | "Comment",
    reporterId: string,
    posterId: string,
    suspensionInput?: { days: number; reason: string }
  ) => {
    try {
      setActiveReportId(reportId);
      switch (action) {
        case "BAN_POST": {
          await updateContentModerationState(targetType, targetId, "banned");
          await updateSingleReportStatus(reportId, "resolved");
          break;
        }
        case "UNBAN_POST":
        case "SHADOW_UNBAN_POST": {
          await updateContentModerationState(targetType, targetId, "active");
          await updateSingleReportStatus(reportId, "pending");
          break;
        }
        case "SHADOW_BAN_POST":
          await updateContentModerationState(targetType, targetId, "shadow_banned");
          await updateSingleReportStatus(reportId, "resolved");
          break;
        case "BAN_USER": {
          await updateUserModerationState(posterId, { blocked: true });
          await updateSingleReportStatus(reportId, "resolved");
          break;
        }
        case "UNBAN_USER":
        case "UNSUSPEND_USER": {
          await updateUserModerationState(posterId, { blocked: false });
          await updateSingleReportStatus(reportId, "pending");
          break;
        }
        case "BAN_REPORTER": {
          await updateUserModerationState(reporterId, { blocked: true });
          await updateSingleReportStatus(reportId, "resolved");
          break;
        }
        case "UNBAN_REPORTER":
        case "UNSUSPEND_REPORTER": {
          await updateUserModerationState(reporterId, { blocked: false });
          await updateSingleReportStatus(reportId, "pending");
          break;
        }
        case "SUSPEND_USER":
        case "SUSPEND_REPORTER": {
          if (!suspensionInput) {
            toast.error("Suspension details are required.");
            return;
          }
          const suspensionPayload = {
            blocked: true,
            suspension: { ends: addDays(new Date().toISOString(), suspensionInput.days), reason: suspensionInput.reason },
          };
          await updateUserModerationState(
            action === "SUSPEND_USER" ? posterId : reporterId,
            suspensionPayload
          );
          await updateSingleReportStatus(reportId, "resolved");
          break;
        }
        case "IGNORE_REPORT":
          await updateSingleReportStatus(reportId, "ignored");
          break;
        case "MARK_PENDING":
          await updateSingleReportStatus(reportId, "pending");
          break;
        case "UNDO_ALL_ACTIONS": {
          const ops = await Promise.allSettled([
            updateContentModerationState(targetType, targetId, "active"),
            updateUserModerationState(posterId, { blocked: false }),
            updateUserModerationState(reporterId, { blocked: false }),
            updateSingleReportStatus(reportId, "pending"),
          ]);

          const failed = ops.filter((result) => result.status === "rejected");
          if (failed.length > 0) {
            throw new Error(`Undo failed for ${failed.length} operation(s).`);
          }
          break;
        }
        default:
          console.error("Unknown action type:", action);
          return;
      }

      const localStatus: "pending" | "resolved" | "ignored" =
        action === "IGNORE_REPORT"
          ? "ignored"
          : action === "MARK_PENDING" ||
            action === "UNDO_ALL_ACTIONS" ||
            action === "UNBAN_POST" ||
            action === "SHADOW_UNBAN_POST" ||
            action === "UNBAN_USER" ||
            action === "UNSUSPEND_USER" ||
            action === "UNBAN_REPORTER" ||
            action === "UNSUSPEND_REPORTER"
            ? "pending"
            : "resolved";

      updateReportStatus(targetId, reportId, localStatus);
      await onRefresh?.();
      toast.success(action === "UNDO_ALL_ACTIONS" ? "All actions were undone." : `Successfully performed ${action}`);
    } catch (error) {
      console.error(`Error performing ${action}`, error);
      const message = error instanceof Error ? error.message : `Error performing ${action}`;
      toast.error(message);
    } finally {
      setActiveReportId(null);
    }
  };

  const onConfirmSuspension = async () => {
    if (!pendingSuspension) return;

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
      setIsSuspending(true);
      await handleAction(
        pendingSuspension.action,
        pendingSuspension.reportId,
        pendingSuspension.targetId,
        pendingSuspension.targetType,
        pendingSuspension.reporterId,
        pendingSuspension.posterId,
        { days, reason }
      );
      setPendingSuspension(null);
    } finally {
      setIsSuspending(false);
    }
  };

  const rows = reports.flatMap((groupedReport) => {
    const { targetDetails, reports } = groupedReport;
    const postId = targetDetails?.id || "";
    const posterId = targetDetails?.postedBy || "";
    const targetType = groupedReport.type;

    return reports.map((report) => ({
      ...report,
      targetDetails,
      postId,
      posterId,
      targetType,
    }));
  });

  const columns: ColumnDefinition<typeof rows[0]>[] = [
    {
      key: "targetDetails.title",
      label: "Post",
      render: (row) => (
        <div className="text-zinc-200 font-medium flex items-center gap-2">
          <span>{row.targetDetails?.title || "Untitled Post"}</span>
          {row.targetDetails?.isBanned && (
            <Badge variant="destructive" className="text-xs">Banned</Badge>
          )}
          {row.targetDetails?.isShadowBanned && !row.targetDetails?.isBanned && (
            <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">Shadowbanned</Badge>
          )}
        </div>
      ),
      className: "w-[300px]",
    },
    {
      key: "reporter.username",
      label: "Reporter",
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span>{row.reporter.username}</span>
          {row.reporter.isBlocked && (
            <Badge variant="destructive" className="text-xs">Blocked</Badge>
          )}
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (row) => <span className="text-sm text-zinc-400">{row.reason || "-"}</span>,
    },
    {
      key: "message",
      label: "Message",
      render: (row) => <span className="text-sm text-zinc-400">{row.message || "-"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const formattedStatus = row.status.charAt(0).toUpperCase() + row.status.slice(1);
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        let extraClasses = "";

        if (row.status.toLowerCase() === "pending") {
          variant = "outline";
          extraClasses = "bg-yellow-600/40 border-none text-white";
        } else if (row.status.toLowerCase() === "resolved") {
          variant = "default";
          extraClasses = "bg-green-600 border-none text-white";
        } else if (row.status.toLowerCase() === "ignored") {
          variant = "secondary";
          extraClasses = "bg-zinc-700 border-none text-white";
        }

        return (
          <Badge variant={variant} className={extraClasses}>
            {formattedStatus}
          </Badge>
        );
      },
      className: "text-right",
    },
  ];

  const renderActions = (row: typeof rows[0]) => {
    const activeReporterSuspension = hasActiveSuspension(row.reporter.suspension?.ends);
    const isBusy = activeReportId === row.id || isSuspending;
    const isComment = row.targetType === "Comment";
    const isIgnored = row.status === "ignored";
    const isPending = row.status === "pending";
    const postIsBanned = Boolean(row.targetDetails?.isBanned);
    const postIsShadowBanned = Boolean(row.targetDetails?.isShadowBanned);

    const buildAction = (action: actionType) => () =>
      handleAction(action, row.id, row.postId, row.targetType, row.reporter.id, row.posterId);
    const openSuspensionDialog = (action: "SUSPEND_USER" | "SUSPEND_REPORTER") => () =>
      setPendingSuspension({
        action,
        reportId: row.id,
        targetId: row.postId,
        targetType: row.targetType,
        reporterId: row.reporter.id,
        posterId: row.posterId,
      });

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
          <DropdownMenuItem className="cursor-pointer" disabled={isBusy || postIsBanned} onClick={buildAction("BAN_POST")}>
            Ban Post
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" disabled={isBusy || !postIsBanned} onClick={buildAction("UNBAN_POST")}>
            Unban Post
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isBusy || isComment || postIsBanned || postIsShadowBanned}
            onClick={buildAction("SHADOW_BAN_POST")}
          >
            Shadow Ban Post
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isBusy || isComment || !postIsShadowBanned}
            onClick={buildAction("SHADOW_UNBAN_POST")}
          >
            Shadow Unban Post
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-500/70" />
          <DropdownMenuItem className="cursor-pointer" disabled={isBusy || isIgnored} onClick={buildAction("BAN_USER")}>
            Ban User
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" disabled={isBusy || isPending} onClick={buildAction("UNBAN_USER")}>
            Unban User
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isBusy || isIgnored}
            onClick={openSuspensionDialog("SUSPEND_USER")}
          >
            Suspend User
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" disabled={isBusy || isPending} onClick={buildAction("UNSUSPEND_USER")}>
            Remove User Suspension
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-500/70" />
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isBusy || row.reporter.isBlocked}
            onClick={buildAction("BAN_REPORTER")}
          >
            Ban Reporter
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isBusy || !row.reporter.isBlocked}
            onClick={buildAction("UNBAN_REPORTER")}
          >
            Unban Reporter
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isBusy || row.reporter.isBlocked || activeReporterSuspension}
            onClick={openSuspensionDialog("SUSPEND_REPORTER")}
          >
            Suspend Reporter
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isBusy || !activeReporterSuspension}
            onClick={buildAction("UNSUSPEND_REPORTER")}
          >
            Remove Reporter Suspension
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-500/70" />
          <DropdownMenuItem className="cursor-pointer" disabled={isBusy || isPending} onClick={buildAction("MARK_PENDING")}>
            Mark Pending
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" disabled={isBusy || isIgnored} onClick={buildAction("IGNORE_REPORT")}>
            Ignore Report
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-500/70" />
          <DropdownMenuItem
            className="cursor-pointer text-amber-300 focus:text-zinc-900"
            disabled={isBusy || isPending}
            onClick={buildAction("UNDO_ALL_ACTIONS")}
          >
            Undo All Actions
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <>
      <TableWrapper
        data={rows}
        columns={columns}
        renderActions={renderActions}
        tableClassName="w-full"
        rowClassName="border-zinc-700"
      />

      <Dialog open={Boolean(pendingSuspension)} onOpenChange={(open) => !open && setPendingSuspension(null)}>
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
              onClick={() => setPendingSuspension(null)}
              className="border-zinc-700 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
            >
              Cancel
            </Button>
            <Button type="button" onClick={onConfirmSuspension} disabled={isSuspending}>
              {isSuspending ? "Suspending..." : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportedPostTable;

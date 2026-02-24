import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { HiDotsHorizontal } from "react-icons/hi";
import axios from "axios";
import { env } from "@/config/env";
import { toast } from "sonner";
import useReportStore from "@/store/ReportStore";
import { ReportedPost } from "@/types/ReportedPost";
import { TableWrapper, ColumnDefinition } from "@/components/general/TableWrapper";

type actionType = "BAN_POST" | "SHADOW_BAN_POST" | "BAN_REPORTER" | "IGNORE_REPORT" | "BAN_USER" | "SUSPEND_USER" | "SUSPEND_REPORTER";

function addDays(isoString: string, days = 3): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) throw new Error("Invalid ISO date string");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

const ReportedPostTable = ({ reports }: { reports: ReportedPost[] }) => {
  const { updateReportStatus } = useReportStore();

  const handleAction = async (
    action: actionType,
    reportId: string,
    targetId: string,
    reporterId: string,
    posterId: string
  ) => {
    try {
      let url = "";
      let payload = {};

      switch (action) {
        case "BAN_POST":
          url = `${env.apiUrl}/manage/posts/ban/${targetId}`;
          break;
        case "SHADOW_BAN_POST":
          url = `${env.apiUrl}/manage/posts/shadowban/${targetId}`;
          break;
        case "BAN_USER":
        case "BAN_REPORTER": {
          const userId = action === "BAN_USER" ? posterId : reporterId;
          url = `${env.apiUrl}/manage/users/block/${userId}`;
          payload = {
            ends: addDays(new Date().toISOString(), 3),
            reason: "Violation of community guidelines",
          };
          break;
        }
        case "SUSPEND_USER":
        case "SUSPEND_REPORTER": {
          const userId = action === "SUSPEND_USER" ? posterId : reporterId;
          url = `${env.apiUrl}/manage/users/suspension/${userId}`;
          const daysInput = window.prompt("Enter number of days for suspension:", "3");
          const days = parseInt(daysInput ?? "3", 10);
          if (isNaN(days) || days <= 0) {
            toast.error("Suspension cancelled — invalid number of days.");
            return;
          }
          const reason = window.prompt("Enter reason for suspension:");
          if (!reason) {
            toast.error("Suspension cancelled — reason is required.");
            return;
          }
          payload = { ends: addDays(new Date().toISOString(), days), reason };
          break;
        }
        case "IGNORE_REPORT":
          url = `${env.apiUrl}/manage/reports/status/${reportId}`;
          payload = { status: "ignored" };
          break;
        default:
          console.error("Unknown action type:", action);
          return;
      }

      await axios.patch(url, payload, { withCredentials: true });
      toast.success(`Successfully performed ${action}`);
      updateReportStatus(targetId, reportId, action === "IGNORE_REPORT" ? "ignored" : "resolved");
    } catch (error) {
      console.error(`Error performing ${action}`, error);
      toast.error(`Error performing ${action}`);
    }
  };

  const rows = reports.flatMap((groupedReport) => {
    const { targetDetails, reports } = groupedReport;
    const postId = targetDetails?.id || "";
    const posterId = targetDetails?.postedBy || "";

    return reports.map((report) => ({
      ...report,
      targetDetails,
      postId,
      posterId,
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
          extraClasses = "border-yellow-500 text-yellow-500";
        } else if (row.status.toLowerCase() === "resolved") {
          variant = "default";
          extraClasses = "bg-green-600 hover:bg-green-600/80 text-white";
        } else if (row.status.toLowerCase() === "ignored") {
          variant = "secondary";
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
    const buildAction = (action: actionType) => () =>
      handleAction(action, row.id, row.postId, row.reporter.id, row.posterId);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm text-zinc-100 bg-zinc-700 rounded-md">
            <HiDotsHorizontal />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-700 text-zinc-100 border-zinc-700" align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={buildAction("BAN_POST")}>
            Ban Post
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={buildAction("SHADOW_BAN_POST")}>
            Shadow Ban Post
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-500/70" />
          <DropdownMenuItem className="cursor-pointer" onClick={buildAction("BAN_USER")}>
            Ban User
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={buildAction("SUSPEND_USER")}>
            Suspend User
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-500/70" />
          <DropdownMenuItem className="cursor-pointer" onClick={buildAction("BAN_REPORTER")}>
            Ban Reporter
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={buildAction("SUSPEND_REPORTER")}>
            Suspend Reporter
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-500/70" />
          <DropdownMenuItem className="cursor-pointer" onClick={buildAction("IGNORE_REPORT")}>
            Ignore Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <TableWrapper
      data={rows}
      columns={columns}
      renderActions={renderActions}
      tableClassName="w-full"
      rowClassName="border-zinc-700"
    />
  );
};

export default ReportedPostTable;

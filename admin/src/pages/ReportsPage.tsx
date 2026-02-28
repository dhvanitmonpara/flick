import { useCallback, useEffect, useMemo, useState } from "react";
import { http } from "@/services/http";
import ReportPost from "@/components/general/ReportPost";
import PaginationTemplate from "@/components/general/PaginationTemplate";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IoRefresh } from "react-icons/io5";
import { Loader2 } from "lucide-react";
import useReportStore from "@/store/ReportStore";
import { ReportedPost } from "@/types/ReportedPost";

type ReportStatusFilter = "pending" | "resolved" | "ignored";

const ReportsPage = () => {
  const { reports, setReports } = useReportStore();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>("pending");

  const limit = 10;
  const statuses = useMemo(() => [statusFilter], [statusFilter]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const statusQuery = statuses.join(",");
      const queryParamsObj: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
        status: statusQuery,
      };

      const queryParams = new URLSearchParams(queryParamsObj).toString();

      const res = await http.get(`/manage/reports?${queryParams}`);
      const payload = res.data as {
        data: ReportedPost[];
        pagination: { totalReports: number; page: number; limit: number };
      };

      if (res.status !== 200 || !payload?.data || !payload?.pagination) {
        throw new Error("Invalid response from server");
      }

      const { data, pagination } = payload;

      setReports(data || []);
      setTotalPages(Math.max(1, Math.ceil((pagination.totalReports || 0) / limit)));
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error fetching reported posts:", err.message);
        toast.error(err.message);
      } else {
        console.error("Error fetching reported posts:", err);
        toast.error("Failed to load reported posts.");
      }
    } finally {
      setLoading(false);
    }
  }, [statuses, page, setReports]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, page, statuses]);

  return (
    <div className="flex flex-col items-center col-span-10 p-2 md:p-4">
      <div className="flex flex-wrap items-center gap-2 w-full px-2 md:px-6 pt-4 md:pt-6 pb-4">
        <h2 className="text-2xl self-start">Reports</h2>
        <div className="ml-0 md:ml-6 flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={statusFilter === "pending" ? "default" : "outline"}
            className={statusFilter === "pending" ? "bg-yellow-600 hover:bg-yellow-500 text-white" : "border-zinc-700 text-zinc-200 hover:bg-zinc-800"}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            type="button"
            size="sm"
            variant={statusFilter === "resolved" ? "default" : "outline"}
            className={statusFilter === "resolved" ? "bg-green-600 hover:bg-green-500 text-white" : "border-zinc-700 text-zinc-200 hover:bg-zinc-800"}
            onClick={() => setStatusFilter("resolved")}
          >
            Resolved
          </Button>
          <Button
            type="button"
            size="sm"
            variant={statusFilter === "ignored" ? "default" : "outline"}
            className={statusFilter === "ignored" ? "bg-zinc-600 hover:bg-zinc-500 text-white" : "border-zinc-700 text-zinc-200 hover:bg-zinc-800"}
            onClick={() => setStatusFilter("ignored")}
          >
            Ignored
          </Button>
        </div>
        <Button className="ml-auto mr-8 bg-zinc-800 hover:bg-zinc-700" onClick={fetchReports}>
          {loading ? <Loader2 className="animate-spin" /> : <IoRefresh />}
        </Button>
      </div>
      {loading
        ? <div>Loading reported posts...</div>
        : reports && reports.length > 0 ? <ReportPost reports={reports} onRefresh={fetchReports} /> : <div className={`bg-zinc-800/50 px-3 w-full ${reports && reports.length === 0 && "min-h-52"} flex justify-center items-center rounded-md`}>No {statusFilter} reports found</div>
      }
      {reports && reports.length > 0 && <PaginationTemplate
        onPageChange={setPage}
        page={page}
        totalPages={totalPages}
      />}
    </div>
  );
};

export default ReportsPage;

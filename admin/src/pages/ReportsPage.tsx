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

const ReportsPage = () => {
  const { reports, setReports } = useReportStore();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;
  const statuses = useMemo(() => ["pending", "resolved"], []);

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
    fetchReports();
  }, [fetchReports, page, statuses]);

  return (
    <div className="flex flex-col items-center col-span-10 p-2">
      <div className="flex items-center w-full">
        <h2 className="px-8 pt-10 pb-8 text-2xl self-start">Posts</h2>
        <Button className="ml-auto mr-8 bg-zinc-800 hover:bg-zinc-700" onClick={fetchReports}>
          {loading ? <Loader2 className="animate-spin" /> : <IoRefresh />}
        </Button>
      </div>
      {loading
        ? <div>Loading reported posts...</div>
        : <div className={`bg-zinc-800/50 px-3 w-full ${reports && reports.length === 0 && "min-h-52"} rounded-md`}>
          {reports && reports.length > 0 ? <ReportPost reports={reports} /> : <>No reported posts found</>}
        </div>
      }
      <PaginationTemplate
        onPageChange={setPage}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
};

export default ReportsPage;

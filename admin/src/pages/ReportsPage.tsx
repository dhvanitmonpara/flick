import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { env } from "@/config/env";
import ReportPost from "@/components/general/ReportPost";
import PaginationTemplate from "@/components/general/PaginationTemplate";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IoRefresh } from "react-icons/io5";
import { Loader2 } from "lucide-react";
import { APIResponse } from "@/types/APIResponse";
import useReportStore from "@/store/ReportStore";

const fields = [
  "_id",           // post._id
  "title",         // post.title
  "content",       // post.content
  "postedBy",      // post.postedBy
  "isBanned",      // post.isBanned
  "isShadowBanned" // post.isShadowBanned
];

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
        status: statusQuery, // e.g., "pending,resolved"
        ...(Array.isArray(fields) && fields.length > 0 ? { fields: fields.join(",") } : {}),
      };

      const queryParams = new URLSearchParams(queryParamsObj).toString();
      console.log(queryParams, queryParamsObj)

      // API call
      const res = await axios.get<APIResponse>(
        `${env.apiUrl}/manage/reports?${queryParams}`,
        { withCredentials: true }
      );

      if (res.status !== 200 || !res.data?.data || !res.data?.pagination) {
        throw new Error("Invalid response from server");
      }

      const { data, pagination } = res.data;

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

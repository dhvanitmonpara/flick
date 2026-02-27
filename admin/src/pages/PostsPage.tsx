import { useCallback, useEffect, useMemo, useState } from "react";
import { http } from "@/services/http";
import ReportPost from "@/components/general/ReportPost";
import PaginationTemplate from "@/components/general/PaginationTemplate";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IoRefresh } from "react-icons/io5";
import { Loader2 } from "lucide-react";
import { ReportedPost } from "@/types/ReportedPost";

const PostsPage = () => {
  const [reports, setReports] = useState<ReportedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;
  const statuses = useMemo(() => ["pending", "resolved"], []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const statusQuery = statuses.join(",");
      const res = await http.get(`/manage/reports?page=${page}&limit=${limit}&status=${statusQuery}`);
      const payload = res.data as {
        data: ReportedPost[];
        pagination: { totalReports: number; page: number; limit: number };
      };

      setReports(payload.data || []);
      setTotalPages(Math.max(1, Math.ceil((payload.pagination?.totalReports || 0) / limit)));
    } catch (err) {
      console.error("Error fetching reported posts:", err);
      toast.error("Failed to load reported posts.");
    } finally {
      setLoading(false);
    }
  }, [page, statuses])

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
        : <div className={`bg-zinc-800/50 w-full ${reports.length === 0 && "min-h-52"} rounded-md`}>
          <ReportPost reports={reports} />
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

export default PostsPage;

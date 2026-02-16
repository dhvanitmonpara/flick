import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaInfoCircle } from "react-icons/fa";

import { env } from "@/config/env";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import PaginationTemplate from "@/components/general/PaginationTemplate";
import { TableWrapper, ColumnDefinition } from "@/components/general/TableWrapper";

type LogItem = {
  _id: string;
  action: string;
  platform: string;
  status: string;
  timestamp: string;
  userId?: string;
  metadata?: { [key: string]: string }[];
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export default function LogPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${env.apiUrl}/manage/logs?page=${pagination.page}&limit=${pagination.limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        { withCredentials: true }
      );
      if (res.status !== 200) {
        throw new Error("Failed to fetch logs.");
      }

      setLogs(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const columns: ColumnDefinition<LogItem>[] = [
    {
      key: "timestamp",
      label: (
        <span onClick={() => handleSort("timestamp")} className="cursor-pointer">
          Timestamp {sortBy === "timestamp" && (sortOrder === "asc" ? "↑" : "↓")}
        </span>
      ),
      render: (row) => new Date(row.timestamp).toLocaleString(),
    },
    {
      key: "action",
      label: (
        <span onClick={() => handleSort("action")} className="cursor-pointer">
          Action {sortBy === "action" && (sortOrder === "asc" ? "↑" : "↓")}
        </span>
      ),
    },
    {
      key: "platform",
      label: (
        <span onClick={() => handleSort("platform")} className="cursor-pointer">
          Platform {sortBy === "platform" && (sortOrder === "asc" ? "↑" : "↓")}
        </span>
      ),
    },
    {
      key: "status",
      label: (
        <span onClick={() => handleSort("status")} className="cursor-pointer">
          Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
        </span>
      ),
    },
    {
      key: "metadata",
      label: "Metadata",
      render: (row) =>
        row.metadata && row.metadata.length > 0 ? (
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="text-zinc-100 underline cursor-pointer">
                <FaInfoCircle />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-48 p-2 bg-zinc-800 border-zinc-800">
              <ul>
                {row.metadata.map((meta, idx) =>
                  Object.entries(meta).map(([key, value]) => (
                    <li key={`${idx}-${key}`}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))
                )}
              </ul>
            </HoverCardContent>
          </HoverCard>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <div className="p-6 col-span-10">
      <div className={`bg-zinc-800/50 px-3 w-full ${logs.length === 0 && "min-h-52"} rounded-md`}>
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-4 text-center">No logs found.</div>
        ) : (
          <TableWrapper<LogItem>
            data={logs}
            columns={columns}
            rowClassName="hover:bg-zinc-800 group border-zinc-800"
            tableClassName="w-full overflow-x-auto"
          />
        )}
      </div>

      <PaginationTemplate
        onPageChange={(p: number) =>
          setPagination((prev) => ({ ...prev, page: p }))
        }
        page={pagination.page}
        totalPages={Math.ceil(pagination.total / pagination.limit)}
      />
    </div>
  );
}

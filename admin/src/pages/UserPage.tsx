import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { User } from "@/types/User";
import { UserTable } from "../components/general/UserTable";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { http } from "@/services/http";
import PaginationTemplate from "../components/general/PaginationTemplate";
import { Badge } from "../components/ui/badge";

type AdminListUser = {
  authId: string;
  userId: string | null;
  username: string | null;
  branch: string | null;
  collegeId: string | null;
  banned: boolean | null;
  banExpires: string | null;
  banReason: string | null;
};

function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({ username: "", email: "" });

  const limit = 20;

  const mapListUser = (user: AdminListUser): User => ({
    id: user.userId || user.authId,
    username: user.username || "-",
    branch: user.branch || "-",
    college: user.collegeId || "",
    isBlocked: Boolean(user.banned),
    suspension: {
      ends: user.banExpires,
      reason: user.banReason,
      howManyTimes: 0,
    },
  });

  const fetchAllUsers = useCallback(async (targetPage: number) => {
    try {
      setIsLoading(true);
      const offset = (targetPage - 1) * limit;
      const res = await http.get(`/users?limit=${limit}&offset=${offset}`);

      if (res.status !== 200) {
        toast.error("Failed to fetch users.");
        return;
      }

      const payload = res.data as {
        users: AdminListUser[];
        total: number;
        limit: number;
        offset: number;
      };

      setUsers((payload.users || []).map(mapListUser));
      setTotalPages(Math.max(1, Math.ceil((payload.total || 0) / limit)));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    try {
      setIsLoading(true);
      const username = filters.username.trim();
      const email = filters.email.trim();

      // With empty filters, use paginated default list endpoint instead of search.
      if (!username && !email) {
        setIsSearching(false);
        setPage(1);
        await fetchAllUsers(1);
        return;
      }

      const params = new URLSearchParams();
      if (username) params.set("username", username);
      if (email) params.set("email", email);
      const query = params.toString();

      const res = await http.get<{ success: boolean; users: User[] }>(
        `/users/search${query ? `?${query}` : ""}`
      );
      if (res.status !== 200) {
        toast.error("Failed to fetch users.");
        return;
      }

      setIsSearching(true);
      setPage(1);
      setTotalPages(1);
      setUsers(res.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSearching) {
      fetchAllUsers(page);
    }
  }, [isSearching, page, fetchAllUsers]);

  const stats = useMemo(() => {
    const blocked = users.filter((user) => user.isBlocked).length;
    const suspended = users.filter((user) => {
      if (!user.suspension?.ends) return false;
      const endsAt = new Date(user.suspension.ends);
      return !Number.isNaN(endsAt.getTime()) && endsAt.getTime() > Date.now();
    }).length;

    return {
      total: users.length,
      blocked,
      suspended,
      active: users.length - blocked,
    };
  }, [users]);

  const handleResetFilters = async () => {
    setFilters({ username: "", email: "" });
    setIsSearching(false);
    setPage(1);
    await fetchAllUsers(1);
  };

  return (
    <div className="p-6 ">
      <div className="mb-6">
        <p className="text-2xl font-semibold text-zinc-100">User Management</p>
        <p className="text-sm text-zinc-400 mt-1">Review users, manage bans, and control suspensions.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs text-zinc-400">Visible Users</p>
          <p className="text-2xl font-semibold text-zinc-100 mt-1">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs text-zinc-400">Active</p>
          <p className="text-2xl font-semibold text-green-400 mt-1">{stats.active}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs text-zinc-400">Blocked</p>
          <p className="text-2xl font-semibold text-red-400 mt-1">{stats.blocked}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs text-zinc-400">Suspended</p>
          <p className="text-2xl font-semibold text-yellow-400 mt-1">{stats.suspended}</p>
        </div>
      </div>

      <form className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col lg:flex-row gap-2" onSubmit={onSubmit}>
        <Input
          className="border-zinc-800 bg-zinc-800 focus:border-zinc-200 focus-visible:ring-zinc-200"
          type="text"
          name="username"
          placeholder="Search by username"
          value={filters.username}
          onChange={(event) => setFilters((prev) => ({ ...prev, username: event.target.value }))}
        />
        <Input
          className="border-zinc-800 bg-zinc-800 focus:border-zinc-200 focus-visible:ring-zinc-200"
          type="text"
          name="email"
          placeholder="Search by email"
          value={filters.email}
          onChange={(event) => setFilters((prev) => ({ ...prev, email: event.target.value }))}
        />
        <Button className="bg-zinc-700 hover:bg-zinc-600" type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleResetFilters}
          disabled={isLoading || (!filters.username && !filters.email && !isSearching)}
        >
          Reset
        </Button>
      </form>

      <div className="mb-3">
        {isSearching ? (
          <Badge variant="outline" className="border-zinc-700 text-zinc-300">Filtered Results</Badge>
        ) : (
          <Badge variant="secondary">All Users</Badge>
        )}
      </div>

      {isLoading ? (
        <div className={`bg-zinc-800/50 px-3 py-2 w-full ${users.length === 0 && "min-h-52"} rounded-md border border-zinc-800`}>
          <div className="space-y-3 p-3">
            <div className="h-8 rounded bg-zinc-800 animate-pulse" />
            <div className="h-8 rounded bg-zinc-800 animate-pulse" />
            <div className="h-8 rounded bg-zinc-800 animate-pulse" />
            <p className="text-xs text-zinc-400">Loading users...</p>
          </div>
        </div>
      ) : users.length > 0 ? (
        <UserTable data={users} setData={setUsers} />
      ) : (
        <div className="min-h-52 grid place-items-center text-zinc-400">
          No users found for current filters.
        </div>
      )}

      {!isSearching && (
        <PaginationTemplate
          onPageChange={setPage}
          page={page}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}

export default UserPage;

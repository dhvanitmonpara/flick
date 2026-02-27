import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { User } from "@/types/User";
import { UserTable } from "./UserTable";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { http } from "@/services/http";
import PaginationTemplate from "./PaginationTemplate";

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

  const onSubmit = async (data?: React.FormEvent<HTMLFormElement>) => {
    data?.preventDefault();
    try {
      setIsLoading(true);
      const username = data?.currentTarget?.username?.value?.trim();
      const email = data?.currentTarget?.email?.value?.trim();

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

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div className="p-6 col-span-10">
      <form className="flex gap-2 p-4" onSubmit={onSubmit}>
        <Input className="border-zinc-800 bg-zinc-800 focus:border-zinc-200 focus-visible:ring-zinc-200" type="text" name="username" placeholder="Search by username" />
        <Input className="border-zinc-800 bg-zinc-800 focus:border-zinc-200 focus-visible:ring-zinc-200" type="text" name="email" placeholder="Search by email" />
        <Button className="bg-zinc-700 hover:bg-zinc-600" type="submit">Search</Button>
      </form>
      <div className={`bg-zinc-800/50 px-3 w-full ${users.length === 0 && "min-h-52"} rounded-md`}>
        {users.length > 0 ? (
          <UserTable data={users} setData={setUsers} />
        ) : (
          <div>No users found.</div>
        )}
      </div>
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

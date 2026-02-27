import React, { useEffect, useState } from "react";
import axios from "axios";
import { env } from "@/config/env";
import { toast } from "sonner";
import { IUser } from "@/types/User";
import { UserTable } from "./UserTable";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

function UserPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const onSubmit = async (data?: React.FormEvent<HTMLFormElement>) => {
    try {
      const username = data?.currentTarget?.username?.value?.trim();
      const email = data?.currentTarget?.email?.value?.trim();
      const params = new URLSearchParams();
      if (username) params.set("username", username);
      if (email) params.set("email", email);
      const query = params.toString();

      const res = await axios.get(`${env.apiUrl}/admin/users/search${query ? `?${query}` : ""}`, { withCredentials: true });
      if (res.status !== 200) {
        toast.error("Failed to fetch colleges.");
        return;
      }
      setUsers(res.data.data.users);
    } catch (error) {
      console.error("Error fetching colleges:", error);
      toast.error("Failed to fetch colleges.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    onSubmit();
  }, []);

  if (isLoading) return <div>Loading colleges...</div>;

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
    </div>
  );
}

export default UserPage;

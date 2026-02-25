"use client"

import ThemeToggler from "./ThemeToggler"
import UserProfile from "./UserProfile";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import useProfileStore from "@/store/profileStore";
import { toast } from "sonner";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import NotificationButton from "./NotificationButton";
import { userApi } from "@/services/api/user";
import { authClient } from "@/lib/auth-client";

function AuthCard({ className }: { className?: string }) {

  const [fetching, setFetching] = useState(true)
  const setProfile = useProfileStore(state => state.setProfile);
  const { handleError } = useErrorHandler()
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!session?.user) {
          setFetching(false);
          return;
        }

        const user = await userApi.getMe()

        if (user.status !== 200) {
          toast.error(user.data.message || "Something went wrong while fetching user")
          return
        }

        setProfile(user.data)
      } catch (error) {
        handleError(error as AxiosError | Error, "Something went wrong while fetching user", undefined, fetchUser, "Failed to fetch user")
      } finally {
        setFetching(false)
      }
    }

    if (!isPending) {
      fetchUser()
    }
  }, [handleError, setProfile, isPending, session])

  return (
    <div className={`flex justify-center items-center gap-4 ${className}`}>
      <ThemeToggler />
      {isPending || fetching
        ? <span className="bg-zinc-300 animate-pulse h-10 w-10 rounded-full"></span>
        : session?.user ? <>
          <NotificationButton />
          <UserProfile />
        </> : null
      }
    </div>
  )
}

export default AuthCard

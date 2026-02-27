"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { toast } from "sonner";

// Components
import ThemeToggler from "./ThemeToggler";
import UserProfile from "./UserProfile";
import NotificationButton from "./NotificationButton";
import { Button } from "../ui/button";

// Utilities & State
import useProfileStore from "@/store/profileStore";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { userApi } from "@/services/api/user";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  className?: string;
}

export default function AuthCard({ className }: AuthCardProps) {
  const [fetching, setFetching] = useState(true);
  const setProfile = useProfileStore((state) => state.setProfile);
  const { handleError } = useErrorHandler();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!session?.user) {
          setFetching(false);
          return;
        }

        const user = await userApi.getMe();

        if (user.status !== 200) {
          toast.error(user.data.message || "Something went wrong while fetching user");
          return;
        }

        setProfile(user.data);
      } catch (error) {
        handleError(
          error as AxiosError | Error,
          "Something went wrong while fetching user",
          undefined,
          fetchUser,
          "Failed to fetch user"
        );
      } finally {
        setFetching(false);
      }
    };

    if (!isPending) {
      fetchUser();
    }
  }, [handleError, setProfile, isPending, session]);

  // Abstracting the conditional rendering keeps the main return statement clean
  const renderContent = () => {
    if (isPending || fetching) {
      return (
        <div className="flex items-center gap-4">
          {/* Two skeletons look better here to mimic the space of the Notification + Profile buttons */}
          <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
      );
    }

    if (session?.user) {
      return (
        <>
          <NotificationButton />
          <UserProfile />
        </>
      );
    }

    return (
      <Button
        onClick={() => router.push("/auth/signin")}
        className="rounded-full px-6 transition-transform hover:scale-105 active:scale-95"
      >
        Sign In
      </Button>
    );
  };

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <ThemeToggler />
      {renderContent()}
    </div>
  );
}
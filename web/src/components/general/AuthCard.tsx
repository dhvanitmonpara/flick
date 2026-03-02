"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { toast } from "sonner";

import ThemeToggler from "./ThemeToggler";
import UserProfile from "./UserProfile";
import NotificationButton from "./NotificationButton";
import { Button } from "../ui/button";

import useProfileStore from "@/store/profileStore";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { userApi } from "@/services/api/user";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { handleOnboardingError } from "@/utils/onboarding-error-handler";

interface AuthCardProps {
  className?: string;
}

export const SignInButton = () => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push("/auth/signin")}
      className="rounded-full px-6 transition-transform hover:scale-105 active:scale-95"
    >
      Sign In
    </Button>
  );
};

export default function AuthCard({ className }: AuthCardProps) {
  const [fetching, setFetching] = useState(true);
  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);
  const removeProfile = useProfileStore((state) => state.removeProfile);
  const { handleError } = useErrorHandler();
  const { data: session, isPending } = authClient.useSession();

  const navigate = useRouter().push;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!session?.user) {
          removeProfile();
          setFetching(false);
          return;
        }

        const user = await userApi.getMe();

        if (user.status !== 200) {
          toast.error(user.data.message || "Something went wrong while fetching user");
          return;
        }

        setProfile(user.data);
      } catch (error: unknown) {
        const handled = await handleOnboardingError(error, navigate, authClient, removeProfile)
        if (handled) return

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
  }, [handleError, isPending, navigate, removeProfile, session, setProfile]);

  const renderContent = () => {
    if (isPending || fetching) {
      return (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
      );
    }

    if (session?.user && profile?.id) {
      return (
        <>
          <NotificationButton />
          <UserProfile />
        </>
      );
    }

    return (
      <SignInButton />
    );
  };

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <ThemeToggler />
      {renderContent()}
    </div>
  );
}

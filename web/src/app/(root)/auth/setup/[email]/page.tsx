"use client";

import { authApi } from "@/services/api/auth";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

function SetupUserPage() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useRouter().push;
  const { email } = useParams();

  const setupUser = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!email) {
        navigate("/auth/signup");
        return;
      }
      const password = sessionStorage.getItem("pending_signup_password");

      if (!password) {
        toast.error("Signup session expired, please sign up again");
        navigate("/auth/signup");
        return;
      }

      const { success, error } = await authApi.register.register(password);
      if (success) {
        sessionStorage.removeItem("pending_signup_password");

        // Auto-login the user
        const { error: signInError } = await authClient.signIn.email({
          email: decodeURIComponent(email as string),
          password,
        });

        if (signInError) {
          toast.error(
            "Account created, but automatic login failed. Please log in.",
          );
          navigate("/auth/signin");
          return;
        }

        toast.success("User setup successfully");
        setIsLoading(false);
        navigate("/");
      } else {
        console.error("Error setting up user:", error);
        toast.error("Error setting up user");
        return;
      }
    } catch (error) {
      console.error("Error setting up user:", error);
    } finally {
      setIsLoading(false);
    }
  }, [email, navigate]);

  useEffect(() => {
    setupUser();
  }, [setupUser]);

  return (
    <div className="w-96 h-96 flex justify-center items-center flex-col space-y-2">
      <h3>Setting up user</h3>
      {isLoading && (
        <Loader2 className="animate-spin text-zinc-900 dark:text-zinc-100" />
      )}
    </div>
  );
}

export default SetupUserPage;

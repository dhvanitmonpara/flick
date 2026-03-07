"use client";

import { authApi } from "@/services/api/auth";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function PasswordRecoverySetup() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useRouter().push;
  const { email } = useParams();

  const recoverySetup = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!email) {
        navigate("/auth/password-recovery/enter-email");
        return;
      }
      const newPassword = sessionStorage.getItem("pending_reset_password");

      if (!newPassword) {
        toast.error("Reset session expired, please retry");
        navigate("/auth/password-recovery/enter-email");
        return;
      }

      const isResetSuccess = await authApi.resetPassword.finalize(newPassword);
      if (isResetSuccess) {
        sessionStorage.removeItem("pending_reset_password");
        toast.success("Password reset successfully");
        setIsLoading(false);
        navigate("/?reset=true");
      } else {
        console.error("Error resetting password");
        toast.error("Error resetting password");
        return;
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      setIsLoading(false);
    }
  }, [email, navigate]);

  useEffect(() => {
    recoverySetup();
  }, [recoverySetup]);

  return (
    <div className="w-96 h-96">
      <h3>Resetting Password</h3>
      {isLoading && (
        <Loader2 className="animate-spin text-zinc-900 dark:text-zinc-100" />
      )}
    </div>
  );
}

export default PasswordRecoverySetup;

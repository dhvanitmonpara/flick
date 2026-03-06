"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, ShieldBan } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authApi } from "@/services/api/auth";
import useProfileStore from "@/store/profileStore";
import { toastError } from "@/utils/toast-error";
import { OtpVerification } from "@/components/general/OtpVerification";
import { authClient } from "@/lib/auth-client";
import { userApi } from "@/services/api/user";
import { MdBlock } from "react-icons/md";

function SettingsPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<"confirm" | "otp">("confirm");

  // Confirmation state
  const [confirmUsername, setConfirmUsername] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  // OTP state
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Password management state
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(false);

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const { data: session } = authClient.useSession();
  const profile = useProfileStore((state) => state.profile);
  const removeProfile = useProfileStore((state) => state.removeProfile);

  const OTP_EXPIRE_TIME = 60;
  const MAX_ATTEMPTS = 5;

  const isConfirmationValid =
    profile?.username && session?.user?.email &&
    confirmUsername === profile.username.substring(0, 6) &&
    confirmEmail === session.user.email;

  // Fetch password status on mount
  useEffect(() => {
    authApi.password.status()
      .then((data) => setHasPassword(data.hasPassword))
      .catch(() => setHasPassword(null));
  }, []);

  // Fetch blocked users
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        setLoadingBlocked(true);
        const res = await userApi.getBlockedUsers();
        setBlockedUsers(res.data || []);
      } catch {
        // Silently fail
      } finally {
        setLoadingBlocked(false);
      }
    };
    fetchBlockedUsers();
  }, []);

  const handleUnblock = async (userId: string) => {
    try {
      setUnblockingId(userId);
      await userApi.unblockUser(userId);
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User unblocked successfully");
    } catch {
      toast.error("Failed to unblock user");
    } finally {
      setUnblockingId(null);
    }
  };

  const handleSendOtp = useCallback(async () => {
    if (!session?.user?.email || !session?.user?.id) return;
    try {
      setIsResending(true);
      const isSent = await authApi.otp.sendForDeletion(session.user.email, session.user.id);
      if (isSent) {
        setTimeLeft(OTP_EXPIRE_TIME);
        toast.success("OTP sent to your email");
        setStep("otp");
      }
    } catch (error) {
      toastError(error, "Failed to send OTP");
    } finally {
      setIsResending(false);
    }
  }, [session?.user?.email, session?.user?.id]);

  useEffect(() => {
    if (timeLeft > 0 && step === "otp") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

  const verifyOtpAndDelete = async () => {
    if (!session?.user?.id) return;
    try {
      setIsVerifying(true);

      const isVerified = await authApi.otp.verifyOnly(otp, session.user.id);
      if (!isVerified) {
        toast.error("Invalid OTP");
        return;
      }

      setIsDeleting(true);
      const response = await authApi.account.delete();
      if (response.success) {
        removeProfile();
        toast.success("Account deleted successfully!");
        window.location.replace("/auth/signup");
      }
    } catch (error: any) {
      if (error?.response?.status === 400) {
        toast.warning("Wrong OTP, try again");
        setIsOtpInvalid(true);
        setAttempts((prev) => prev + 1);
      } else {
        toastError(error, "Failed to verify OTP or delete account");
      }
    } finally {
      setIsVerifying(false);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (otp.length !== 6 || attempts >= MAX_ATTEMPTS || step !== "otp") return;

    const timer = setTimeout(() => {
      verifyOtpAndDelete();
    }, 300);

    return () => clearTimeout(timer);
  }, [otp, attempts, step]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (hasPassword && !currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    setIsSavingPassword(true);
    try {
      const result = await authApi.password.set(
        newPassword,
        hasPassword ? currentPassword : undefined,
      );
      if (result.success) {
        toast.success(hasPassword ? "Password changed successfully!" : "Password set successfully!");
        setHasPassword(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsPasswordFormVisible(false);
      }
    } catch (error: any) {
      if (error?.response?.status === 400 || error?.response?.status === 401) {
        toast.error(error?.response?.data?.message || "Incorrect current password");
      } else {
        toastError(error, "Failed to save password");
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Account Preferences */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Account Preferences</h2>
          <p className="text-zinc-500 mb-4 text-sm">Update your account settings here.</p>
          <div className="p-4 border dark:border-zinc-800 rounded-lg">
            <p className="text-sm">More settings coming soon.</p>
          </div>
        </section>

        {/* Security / Password */}
        <section className="pt-8 border-t dark:border-zinc-800">
          <h2 className="text-xl font-semibold mb-1">Security</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            {hasPassword === null
              ? "Loading…"
              : hasPassword
                ? "Change your current password."
                : "You signed up via Google. Set a password to also log in with email."}
          </p>

          {hasPassword !== null && (
            <div className="p-4 border dark:border-zinc-800 rounded-lg space-y-4">
              {!isPasswordFormVisible ? (
                <Button
                  onClick={() => setIsPasswordFormVisible(true)}
                  variant="outline"
                >
                  {hasPassword ? "Change Password" : "Set Password"}
                </Button>
              ) : (
                <form
                  onSubmit={handlePasswordSubmit}
                  className="space-y-4"
                >
                  {/* Current password — only shown if user already has one */}
                  {hasPassword && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Current Password</label>
                      <div className="relative">
                        <Input
                          type={showCurrentPass ? "text" : "password"}
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          disabled={isSavingPassword}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                          onClick={() => setShowCurrentPass((v) => !v)}
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      {hasPassword ? "New Password" : "Password"}
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isSavingPassword}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        onClick={() => setShowNewPass((v) => !v)}
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSavingPassword}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        onClick={() => setShowConfirmPass((v) => !v)}
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button type="submit" disabled={isSavingPassword} className="w-full sm:w-auto">
                      {isSavingPassword ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                      ) : "Save Password"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsPasswordFormVisible(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="w-full sm:w-auto"
                      disabled={isSavingPassword}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>

        {/* Blocked Users */}
        <section className="pt-8 border-t dark:border-zinc-800">
          <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
            <MdBlock className="text-zinc-500" />
            Blocked Users
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Users you&apos;ve blocked won&apos;t be able to see your posts or comments, and you won&apos;t see theirs.
          </p>
          <div className="p-4 border dark:border-zinc-800 rounded-lg">
            {loadingBlocked ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : blockedUsers.length === 0 ? (
              <p className="text-sm text-zinc-500">You haven&apos;t blocked anyone.</p>
            ) : (
              <div className="space-y-3">
                {blockedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 px-1 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-semibold">
                        {user.username?.slice(0, 2)?.toUpperCase() || "??"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.username || "Unknown"}</p>
                        <p className="text-xs text-zinc-500">{user.branch || ""}{user.collegeName ? ` · ${user.collegeName}` : ""}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={unblockingId === user.id}
                      onClick={() => handleUnblock(user.id)}
                    >
                      {unblockingId === user.id ? (
                        <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Unblocking…</>
                      ) : "Unblock"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-8 border-t dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-red-600 mb-4 tracking-tight">Danger Zone</h2>
          <div className="p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50/50 dark:bg-red-950/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-400">Delete Account</h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                  Permanently delete your account and all of your content. This action cannot be undone.
                </p>
              </div>

              <Dialog open={isModalOpen} onOpenChange={(open) => {
                setIsModalOpen(open);
                if (!open) {
                  setStep("confirm");
                  setConfirmUsername("");
                  setConfirmEmail("");
                  setOtp("");
                  setIsOtpInvalid(false);
                  setAttempts(0);
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  {step === "confirm" ? (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Account Confirmation</DialogTitle>
                        <DialogDescription>
                          This action is permanent. Please type the first 6 characters of your username (<b>{profile?.username?.substring(0, 6)}</b>) and your full email to confirm.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-red-900/90 dark:text-red-400">Username (first 6 chars)</label>
                          <Input
                            value={confirmUsername}
                            onChange={(e) => setConfirmUsername(e.target.value)}
                            placeholder={profile?.username?.substring(0, 6)}
                            className="focus-visible:ring-red-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-red-900/90 dark:text-red-400">Email Address</label>
                          <Input
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            placeholder={session?.user?.email || ""}
                            className="focus-visible:ring-red-500/50"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button
                          variant="destructive"
                          disabled={!isConfirmationValid || isResending}
                          onClick={handleSendOtp}
                        >
                          {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Send Verification Code
                        </Button>
                      </DialogFooter>
                    </>
                  ) : (
                    <div className="py-2 pb-0 -mx-6 -my-4 sm:-mx-6 shadow-none border-none">
                      <OtpVerification
                        className="border-none shadow-none max-w-full px-6 bg-transparent"
                        isDanger={true}
                        email={session?.user?.email || ""}
                        otp={otp}
                        onOtpChange={(val) => {
                          setOtp(val);
                          setIsOtpInvalid(false);
                        }}
                        onVerify={verifyOtpAndDelete}
                        onResend={handleSendOtp}
                        isLoading={isVerifying || isDeleting}
                        isResending={isResending}
                        timeLeft={timeLeft}
                        attempts={attempts}
                        maxAttempts={MAX_ATTEMPTS}
                        isOtpInvalid={isOtpInvalid}
                        title="Verify Deletion"
                        submitButtonText="Yes, delete my account"
                        submittingButtonText="Deleting..."
                      />
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
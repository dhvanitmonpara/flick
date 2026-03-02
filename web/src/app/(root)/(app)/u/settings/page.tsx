"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { authApi } from "@/services/api/auth";
import useProfileStore from "@/store/profileStore";
import { toastError } from "@/utils/toast-error";

function SettingsPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const removeProfile = useProfileStore((state) => state.removeProfile);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await authApi.account.delete();
      if (response.success) {
        removeProfile();
        toast.success("Account deleted successfully!");
        window.location.replace("/auth/signup");
      }
    } catch (error: unknown) {
      toastError(error, "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Placeholder for other settings sections */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Account Preferences</h2>
          <p className="text-zinc-500 mb-4 text-sm">Update your account settings here.</p>
          <div className="p-4 border dark:border-zinc-800 rounded-lg">
            <p className="text-sm">More settings coming soon.</p>
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

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete Account"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        handleDeleteAccount();
                      }}
                      className="bg-red-600 focus:ring-red-600 hover:bg-red-700 text-white"
                      disabled={isDeleting}
                    >
                      {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Yes, delete my account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@/lib/zod-resolver";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { toast } from "sonner";
import { z } from "zod";

const ResetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
})

const inputStyling = "bg-zinc-200 dark:bg-zinc-800 focus:border-zinc-900 focus-visible:ring-zinc-900 dark:focus:border-zinc-100 dark:focus-visible:ring-zinc-100"

type ResetFormData = z.infer<typeof ResetSchema>

function ResetPassword() {
  const [isPasswordShowing, setIsPasswordShowing] = useState(false);
  const [isConfirmPasswordShowing, setIsConfirmPasswordShowing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false)

  const token = useSearchParams().get('token');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(ResetSchema),
  })

  // BetterAuth error responses aren't fully standard Axios schema in all cases
  const getErrorMessage = (err: unknown, defaultMessage: string) => {
    if (isAxiosError(err)) {
      return err.response?.data?.message || err.response?.data?.error || defaultMessage;
    }
    return defaultMessage;
  };

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      toast.error("Invalid or missing reset token.")
      return
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        fetchOptions: {
          query: {
            token: token
          }
        }
      })

      if (error) {
        toast.error(error.message || "Error resetting password, It might have expired.")
        return
      }

      toast.success("Password reset successfully! Please sign in.");
      router.push(`/auth/signin`)

    } catch (err) {
      console.error("Password reset error", err)
      toast.error(getErrorMessage(err, "Failed to reset password."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto px-6 py-8 border dark:border-zinc-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-6 text-center">New Password</h1>
      {!token && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          No reset token found in URL. Please click the link in your email again.
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="w-full flex relative">
          <Input
            id="password"
            onCopy={() => {
              toast.warning("Copy password at your own risk!")
            }}
            type={isPasswordShowing ? "text" : "password"}
            disabled={isSubmitting || !token}
            placeholder="Enter new password"
            className={inputStyling}
            {...register("password")}
            required
          />
          <div
            className="w-12 absolute right-0 flex justify-center items-center h-full cursor-pointer"
            onClick={() => {
              setIsPasswordShowing((prev) => !prev);
            }}
          >
            {isPasswordShowing ? <IoMdEyeOff /> : <IoMdEye />}
          </div>
        </div>
        {errors.password && <p className="text-red-500 text-sm mt-1">{String(errors.password.message)}</p>}
        <div className="w-full flex relative">
          <Input
            id="confirm-password"
            className={inputStyling}
            disabled={isSubmitting || !token}
            type={isConfirmPasswordShowing ? "text" : "password"}
            placeholder="Confirm new password"
            {...register("confirmPassword")}
            required
          />
          <div
            className="w-12 absolute right-0 flex justify-center items-center h-full cursor-pointer"
            onClick={() => {
              setIsConfirmPasswordShowing((prev) => !prev);
            }}
          >
            {isConfirmPasswordShowing ? <IoMdEyeOff /> : <IoMdEye />}
          </div>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{String(errors.confirmPassword?.message)}</p>}

        <Button
          type="submit"
          disabled={isSubmitting || !token}
          className={`w-full py-2 font-semibold select-none rounded-md dark:text-zinc-900 bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors ${isSubmitting && "bg-zinc-500 cursor-wait"} ${!token && "opacity-50 cursor-not-allowed"}`}
        >
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : "Reset password"}
        </Button>
      </form>
      <p className={`text-center pt-4 ${isSubmitting && "text-zinc-900/50 dark:text-zinc-100/50"}`}>
        Remember your password?{" "}
        <Link
          className={isSubmitting ? "pointer-events-none cursor-not-allowed text-blue-600/50 dark:text-blue-500/50" : "hover:underline text-blue-600 dark:text-blue-500 cursor-pointer"}
          href="/auth/signin">
          Login
        </Link>
      </p>
    </div>
  )
}

export default ResetPassword

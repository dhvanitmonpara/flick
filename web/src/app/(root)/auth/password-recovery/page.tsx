"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@/lib/zod-resolver";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const enterEmailSchema = z.object({
  email: z.email("Email is invalid"),
})

const inputStyling = "bg-zinc-200 dark:bg-zinc-800 focus:border-zinc-900 focus-visible:ring-zinc-900 dark:focus:border-zinc-100 dark:focus-visible:ring-zinc-100"

type EnterEmailFormData = z.infer<typeof enterEmailSchema>

function PasswordRecovery() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const searchParams = useSearchParams();
  const searchEmail = searchParams.get('email');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EnterEmailFormData>({
    resolver: zodResolver(enterEmailSchema),
  })

  useEffect(() => {
    if (searchEmail) {
      setValue("email", searchEmail);
    }
  }, [searchEmail, setValue]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const resetUrl = `${window.location.origin}/auth/password-recovery/reset`;

      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: resetUrl
      })

      if (error) {
        toast.error(error.message || "Error sending reset link. Try again")
        return
      }

      setIsSuccess(true)
    } catch (err) {
      console.error("Password reset error", err)
      if (isAxiosError(err)) {
        toast.error(err.response?.data.error || "Error sending reset link. Try again")
      } else {
        toast.error("Error sending reset link. Try again")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="max-w-md w-full mx-auto px-6 py-8 border dark:border-zinc-800 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-semibold mb-6 flex flex-col justify-center items-center gap-2">
          Check your email
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          We have sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
        </p>
        <Link href="/auth/signin">
          <Button className="w-full">Return to Sign In</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto px-6 py-8 border dark:border-zinc-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-6 text-center">Password Recovery</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="w-full flex relative">
          <Input
            id="email"
            className={inputStyling}
            type="email"
            disabled={isSubmitting}
            placeholder="enrollment@college.in"
            {...register("email")}
            required
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{String(errors.email.message)}</p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 font-semibold select-none rounded-md dark:text-zinc-900 bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors ${isSubmitting && "bg-zinc-500 cursor-wait"}`}
        >
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : "Continue"}
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

export default function Page() {
  return (
    <Suspense>
      <PasswordRecovery />
    </Suspense>
  )
}

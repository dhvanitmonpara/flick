"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@/lib/zod-resolver"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { IoMdEye, IoMdEyeOff } from "react-icons/io"
import { FaGoogle } from "react-icons/fa6"
import { handleGoogleOAuthRedirect } from "@/utils/googleOAuthRedirect"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { userApi } from "@/services/api/user"
import useProfileStore from "@/store/profileStore"
import { handleOnboardingError } from "@/utils/onboarding-error-handler"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const signInSchema = z.object({
  email: z.email("Email is invalid"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type SignInFormData = z.infer<typeof signInSchema>

function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordShowing, setIsPasswordShowing] = useState(false);
  const [isValidatingSession, setIsValidatingSession] = useState(true)
  // Dialog shown when the account was created via OAuth (no password set)
  const [noPasswordEmail, setNoPasswordEmail] = useState<string | null>(null)

  const { data: session, isPending } = authClient.useSession()
  const removeProfile = useProfileStore((state) => state.removeProfile);
  const navigate = useRouter().push

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  useEffect(() => {
    if (isPending) {
      return
    }

    const validateSession = async () => {
      if (!session) {
        setIsValidatingSession(false)
        return
      }

      try {
        const user = await userApi.getMe()
        if (user.status === 200) {
          navigate("/")
          return
        }
      } catch (error: unknown) {
        const handled = await handleOnboardingError(error, navigate, authClient, removeProfile)
        if (handled) return

        toast.error("Error validating session, Try again")
      }

      try {
        await authClient.signOut()
      } finally {
        setIsValidatingSession(false)
      }
    }

    validateSession()
  }, [isPending, navigate, session])

  if (isPending || isValidatingSession) {
    return <div className="flex justify-center items-center flex-col space-y-2">
      <Loader2 className="animate-spin" />
      <p>Validating session...</p>
    </div>
  }

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true)
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.status === 400 && error.code === "NO_PASSWORD_FOUND_ERROR") {
          // OAuth user — show dialog with login alternatives
          setNoPasswordEmail(data.email)
          return
        }
        toast.error(error.message || "Error signing in, Try again")
        return;
      }

      navigate('/')

    } catch (err) {
      console.error("Sign in error", err)
      if (isAxiosError(err)) {
        toast.error(err.response?.data.error || "Error signing in, Try again")
      } else {
        toast.error("Error signing in, Try again")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* ── No-password dialog for OAuth users ────────────────────────────── */}
      <Dialog open={!!noPasswordEmail} onOpenChange={(open) => { if (!open) setNoPasswordEmail(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>No password set</DialogTitle>
            <DialogDescription>
              This account was created via Google Sign-In and doesn&apos;t have a
              password yet. Choose how you&apos;d like to log in:
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              className="w-full"
              onClick={(e) => {
                setNoPasswordEmail(null)
                handleGoogleOAuthRedirect(e as any)
              }}
            >
              <FaGoogle className="mr-2" /> Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (noPasswordEmail) {
                  navigate(`/auth/login-otp/${encodeURIComponent(noPasswordEmail)}`)
                }
                setNoPasswordEmail(null)
              }}
            >
              Login with OTP
            </Button>
            <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 pt-1">
              You can also{" "}
              <Link
                href={noPasswordEmail ? `/auth/password-recovery?email=${noPasswordEmail}` : "/auth/password-recovery"}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => setNoPasswordEmail(null)}
              >
                set a password via email link
              </Link>
              .
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-md w-full mx-auto px-6 py-8 border dark:border-zinc-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold mb-6 text-center">Sign In</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Input
              type="email"
              disabled={isSubmitting}
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{String(errors.email?.message)}</p>
            )}
          </div>

          <div className="w-full flex relative">
            <Input
              id="password"
              disabled={isSubmitting}
              type={isPasswordShowing ? "text" : "password"}
              placeholder="••••••••"
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
          <div className="flex justify-between items-center mt-1">
            {errors.password ? (
              <p className="text-sm text-red-500">{String(errors.password?.message)}</p>
            ) : (
              <div />
            )}
            <Link
              href="/auth/password-recovery"
              className={`text-sm hover:underline text-blue-600 dark:text-blue-500 ${isSubmitting && "pointer-events-none cursor-not-allowed text-blue-600/50 dark:text-blue-500/50"}`}
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 font-semibold select-none rounded-md dark:text-zinc-900 bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors ${isSubmitting && "bg-zinc-500 cursor-wait"}`}
          >
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : "Login"}
          </Button>
        </form>
        <p className="flex justify-center items-center my-4">
          <Separator className="shrink" />
          <span className="px-4 text-zinc-500 dark:text-zinc-500 text-sm">Or</span>
          <Separator className="shrink" />
        </p>
        <form onSubmit={(e: any) => handleGoogleOAuthRedirect(e)}>
          <Button className="w-full">
            <FaGoogle /> Login with Google
          </Button>
        </form>
        <p className={`text-center pt-4 ${isSubmitting && "text-zinc-900/50 dark:text-zinc-100/50"}`}>
          Don&apos;t have an account?{" "}
          <Link
            className={isSubmitting ? "pointer-events-none cursor-not-allowed text-blue-600/50 dark:text-blue-500/50" : "hover:underline text-blue-600 dark:text-blue-500 cursor-pointer"}
            href="/auth/signup">
            Signup
          </Link>
        </p>
      </div>
    </>
  )
}

export default SignInPage

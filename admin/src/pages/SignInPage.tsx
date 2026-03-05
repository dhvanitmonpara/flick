import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@/lib/zod-resolver"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { IoMdEye, IoMdEyeOff } from "react-icons/io"
import useProfileStore from "@/store/profileStore"
import { authClient } from "@/lib/auth-client"
import { hasAdminAccess } from "@/lib/roles"

const signInSchema = z.object({
  email: z.string().email("Email is invalid"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const inputStyling = "bg-zinc-800 border-zinc-800 text-zinc-100 focus:border-zinc-900 focus:border-zinc-100 focus-visible:ring-zinc-100"

type SignInFormData = z.infer<typeof signInSchema>

function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const setProfile = useProfileStore(s => s.setProfile)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true)
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast.error(error.message || "Error signing in, Try again")
        return
      }

      // Wait for the session cookie to be readable before route-guard checks run.
      let sessionUser: any = null
      for (let attempt = 0; attempt < 3; attempt++) {
        const session = await authClient.getSession()
        sessionUser = session?.data?.user ?? null
        if (sessionUser) break
        await new Promise((resolve) => setTimeout(resolve, 120))
      }

      if (!sessionUser) {
        toast.error("Sign in succeeded, but session is not ready. Please try again.")
        return
      }

      if (hasAdminAccess(sessionUser.role)) {
        setProfile({ ...sessionUser, id: sessionUser.id } as any)
        navigate('/', { replace: true })
      } else {
        toast.error("Unauthorized. Admin access only.")
        await authClient.signOut()
      }
    } catch (err: any) {
      console.error("Sign in error", err)
      toast.error(err.message || "Error signing in, Try again")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto px-6 py-8 border border-zinc-800 text-zinc-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-6 text-center">Sign In</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Input
            className={inputStyling}
            type="email"
            disabled={isSubmitting}
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="w-full flex relative">
          <Input
            className={inputStyling}
            onCopy={() => {
              toast.warning("Copy password at your own risk!")
            }}
            type={isPasswordVisible ? "text" : "password"}
            disabled={isSubmitting}
            placeholder="••••••••"
            {...register("password")}
          />
          <div
            className="w-12 absolute right-0 flex justify-center items-center h-full cursor-pointer"
            onClick={() => {
              setIsPasswordVisible((prev) => !prev);
            }}
          >
            {isPasswordVisible ? <IoMdEyeOff /> : <IoMdEye />}
          </div>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 font-semibold select-none rounded-md bg-zinc-200 text-zinc-900 hover:bg-zinc-300 transition-colors ${isSubmitting && "bg-zinc-500 cursor-wait"}`}
        >
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : "Login"}
        </Button>
      </form>
    </div>
  )
}

export default SignInPage

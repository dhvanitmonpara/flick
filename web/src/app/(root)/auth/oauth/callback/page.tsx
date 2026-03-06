"use client"

import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@/lib/zod-resolver"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { branch } from "@/constants/branch"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authApi } from "@/services/api/auth"
import { collegeApi, Branch } from "@/services/api/college"

const signInSchema = z.object({
  branch: branch,
})

export const dynamic = "force-dynamic";

type SignInFormData = z.infer<typeof signInSchema>

function OAuthSetupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)
  const [collegeId, setCollegeId] = useState<string | null>(null)

  const email = useSearchParams().get("email")

  const navigate = useRouter().push

  useEffect(() => {
    const fetchUserAndBranches = async () => {
      try {
        const profile = await authApi.me()
        if (profile.collegeId) {
          setCollegeId(profile.collegeId)
          const collegeBranches = await collegeApi.getCollegeBranches(profile.collegeId)
          setBranches(collegeBranches)
        }
      } catch (error) {
        console.error("Failed to fetch user or branches:", error)
      } finally {
        setIsLoadingBranches(false)
      }
    }
    fetchUserAndBranches()
  }, [])

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      branch: ""
    }
  })

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true)
    try {

      if (!email || !data.branch) {
        toast.error("Please select a branch")
        return
      }

      const isSetupSuccess = await authApi.oauth.setup(email)

      if (!isSetupSuccess) {
        toast.error("Failed to initialize user")
        return
      }

      navigate(`/`)

    } catch (err) {
      toast.error("Error signing in")
      console.error("Sign in error", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto px-6 py-8 border dark:border-zinc-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-6 text-center">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          control={control}
          name="branch"
          render={({ field }) => (
            <Select
              disabled={isSubmitting}
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <SelectTrigger className="bg-zinc-200 dark:bg-zinc-800 focus:border-zinc-900 focus-visible:ring-zinc-900 dark:focus:border-zinc-100 dark:focus-visible:ring-zinc-100">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-200 dark:bg-zinc-800">
                {isLoadingBranches ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : branches.length > 0 ? (
                  branches.map((branchItem) => (
                    <SelectItem className="focus:bg-zinc-300 dark:focus:bg-zinc-700" key={branchItem.id} value={branchItem.name}>{branchItem.name}</SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-zinc-500">No branches available</div>
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.branch && <p className="text-red-500 text-sm mt-1!">{errors.branch.message}</p>}
        <Button
          type="submit"
          disabled={isSubmitting || (errors?.branch && errors.branch !== undefined)}
          className={`w-full py-2 font-semibold rounded-md dark:text-zinc-900 bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors ${isSubmitting && "bg-zinc-500 cursor-wait"}`}
        >
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : "Create an Account"}
        </Button>
      </form>
      {errors.root && <p className="text-red-500 text-sm mt-1!">{errors.root?.message}</p>}
      <p className={`text-center pt-4 ${isSubmitting && "text-zinc-900/50 dark:text-zinc-100/50"}`}>
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          className={isSubmitting ? "pointer-events-none cursor-not-allowed text-blue-600/50 dark:text-blue-500/50" : "hover:underline text-blue-600 dark:text-blue-500 cursor-pointer"}
        >
          Signin
        </Link>
      </p>
    </div>
  )
}

export default OAuthSetupPage
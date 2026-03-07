"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { branch } from "@/constants/branch";
import { collegeApi, Branch } from "@/services/api/college";
import { toastError } from "@/utils/toast-error";
import { AxiosError } from "axios";
import useProfileStore from "@/store/profileStore";
import { authApi } from "@/services/api/auth";

const onboardingSchema = z.object({
  branch: branch,
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

function OnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const collegeIdFromUrl = searchParams.get("collegeId");
  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);

  useEffect(() => {
    const fetchBranches = async () => {
      let collegeId = collegeIdFromUrl || profile?.collegeId || null;

      if (
        !collegeId &&
        profile?.college &&
        typeof profile.college === "object" &&
        "id" in profile.college
      ) {
        collegeId = (profile.college as { id: string }).id;
      }

      try {
        if (collegeId) {
          const collegeBranches =
            await collegeApi.getCollegeBranches(collegeId);
          setBranches(collegeBranches);
        }
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      } finally {
        setIsLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [collegeIdFromUrl, profile]);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      branch: "",
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      const response = await authApi.onboarding.complete(
        branch.parse(data.branch),
      );
      if (response.success && response.data) {
        setProfile(response.data as any);
        toast.success("Onboarding complete!");
        router.push("/");
      } else {
        toast.error("Failed to complete onboarding");
      }
    } catch (err: unknown) {
      if (
        err instanceof AxiosError &&
        err.response?.data.code === "USER_ALREADY_ONBOARDED"
      ) {
        router.push("/");
      } else {
        toastError(err, "Failed to complete onboarding");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)]">
      <div className="max-w-md w-full mx-auto px-6 py-8 border dark:border-zinc-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold mb-2 text-center">Welcome!</h1>
        <p className="text-center text-zinc-500 mb-6">
          Complete your profile to get started.
        </p>
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
                  <SelectValue placeholder="Select your branch" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-200 dark:bg-zinc-800">
                  {isLoadingBranches ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : branches.length > 0 ? (
                    branches.map((branchItem) => (
                      <SelectItem
                        className="focus:bg-zinc-300 dark:focus:bg-zinc-700"
                        key={branchItem.id}
                        value={branchItem.name}
                      >
                        {branchItem.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-zinc-500">
                      No branches available
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.branch && (
            <p className="text-red-500 text-sm mt-1!">
              {String(errors.branch?.message)}
            </p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !!errors.branch}
            className={`w-full py-2 font-semibold rounded-md dark:text-zinc-900 bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors ${isSubmitting && "bg-zinc-500 cursor-wait"}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </>
            ) : (
              "Complete Onboarding"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingPage;

"use client";

import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FileInput from "@/components/ui/FileInput";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@/lib/zod-resolver";
import { authApi } from "@/services/api/auth";
import { collegeApi } from "@/services/api/college";
import { ocrApi } from "@/services/api/ocr";
import { handleGoogleOAuthRedirect } from "@/utils/googleOAuthRedirect";
import { toastError } from "@/utils/toast-error";

const signUpSchema = z
  .object({
    email: z.email("Email is invalid"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

const requestCollegeSchema = z
  .object({
    name: z.string().min(2, "College name is required"),
    emailDomain: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[\w.-]+\.[a-z]{2,}$/i, "Enter a valid college email domain"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    requestedByEmail: z.email("Enter a valid college email"),
  })
  .superRefine((value, ctx) => {
    const requesterDomain = value.requestedByEmail.split("@")[1]?.toLowerCase();
    if (requesterDomain !== value.emailDomain.toLowerCase()) {
      ctx.addIssue({
        code: "custom",
        path: ["requestedByEmail"],
        message: "Requester email must match the college email domain",
      });
    }
  });

type RequestCollegeFormData = z.infer<typeof requestCollegeSchema>;

function SignUpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isPasswordShowing, setIsPasswordShowing] = useState(false);
  const [isConfirmPasswordShowing, setIsConfirmPasswordShowing] =
    useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const isSubmittingRef = useRef(false);

  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const {
    register: registerRequest,
    handleSubmit: handleRequestSubmit,
    setValue: setRequestValue,
    reset: resetRequestForm,
    formState: { errors: requestErrors },
  } = useForm<RequestCollegeFormData>({
    resolver: zodResolver(requestCollegeSchema),
    defaultValues: {
      name: "",
      emailDomain: "",
      city: "",
      state: "",
      requestedByEmail: "",
    },
  });

  useEffect(() => {
    if (!isPending && session) {
      router.push("/");
    }
  }, [isPending, session, router]);

  if (!isPending && session) {
    return null;
  }

  const openCollegeRequestDialog = (email: string) => {
    const emailDomain = email.split("@")[1]?.toLowerCase() ?? "";
    setRequestValue("requestedByEmail", email, { shouldValidate: true });
    setRequestValue("emailDomain", emailDomain, { shouldValidate: true });
    setIsRequestDialogOpen(true);
  };

  const onRequestCollegeSubmit = async (data: RequestCollegeFormData) => {
    setIsSubmittingRequest(true);

    try {
      await collegeApi.requestCollege(data);
      toast.success("College request submitted. We’ll review it soon.");
      setIsRequestDialogOpen(false);
      resetRequestForm({
        name: "",
        emailDomain: data.emailDomain,
        city: "",
        state: "",
        requestedByEmail: data.requestedByEmail,
      });
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data?.code === "COLLEGE_REQUEST_ALREADY_EXISTS") {
        toast.info("College already requested. Please wait for admin approval. You can check again in a few hours.", { duration: 5000 });
      } else {
        toastError(err, "Failed to submit college request");
      }
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      if (!data.email || !data.password) {
        toast.error("Please fill all the fields");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      const response = await authApi.register.initialize(
        data.email,
        data.password,
      );

      if (!response.success) {
        toast.error("Failed to initialize user");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      sessionStorage.setItem("pending_signup_password", data.password);
      router.push(`/auth/otp/${data.email}`);
    } catch (err: unknown) {
      if (
        err instanceof AxiosError &&
        err.response?.data?.code === "COLLEGE_NOT_FOUND"
      ) {
        openCollegeRequestDialog(data.email);
        toast.info("College not found. Submit a request for admin review.");
      } else {
        toastError(err, "Failed to initialize user");
      }
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-6 py-8 border dark:border-zinc-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-6 text-center">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FileInput
          onFileInput={async (file) => {
            const formData = new FormData();
            formData.append("studentId", file);
            const response = await ocrApi.extractStudentDetails(formData);

            return response.data;
          }}
          setData={(result) => {
            if (!result.data) {
              toast.info("Please upload a valid college id card");
              return;
            }
            const { email } = result.data;
            if (email) setValue("email", email);
          }}
          name="studentId"
          required={false}
          maxSizeMB={10}
          placeholder="Upload a scan of your college id card"
        />
        <Input
          id="email"
          disabled={isSubmitting}
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          required
          autoFocus
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1!">
            {String(errors.email?.message)}
          </p>
        )}
        <div className="w-full flex relative">
          <Input
            id="password"
            onCopy={() => {
              toast.warning("Copy password at your own risk!");
            }}
            type={isPasswordShowing ? "text" : "password"}
            disabled={isSubmitting}
            placeholder="Enter password"
            {...register("password")}
            required
          />
          <button
            type="button"
            className="w-12 absolute right-0 flex justify-center items-center h-full cursor-pointer bg-transparent border-none"
            onClick={() => {
              setIsPasswordShowing((prev) => !prev);
            }}
          >
            {isPasswordShowing ? <IoMdEyeOff /> : <IoMdEye />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1!">
            {String(errors.password?.message)}
          </p>
        )}
        <div className="w-full flex relative">
          <Input
            id="confirm-password"
            disabled={isSubmitting}
            type={isConfirmPasswordShowing ? "text" : "password"}
            placeholder="Confirm password"
            {...register("confirmPassword")}
            required
          />
          <button
            type="button"
            className="w-12 absolute right-0 flex justify-center items-center h-full cursor-pointer bg-transparent border-none"
            onClick={() => {
              setIsConfirmPasswordShowing((prev) => !prev);
            }}
          >
            {isConfirmPasswordShowing ? <IoMdEyeOff /> : <IoMdEye />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1!">
            {String(errors.confirmPassword?.message)}
          </p>
        )}

        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !!errors?.email ||
            !!errors?.password ||
            !!errors?.confirmPassword
          }
          className={`w-full py-2 font-semibold rounded-md dark:text-zinc-900 bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors ${isSubmitting ? "bg-zinc-500 cursor-wait" : ""}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </>
          ) : (
            "Create an Account"
          )}
        </Button>
      </form>
      {errors.root && (
        <p className="text-red-500 text-sm mt-1!">
          {String(errors.root?.message)}
        </p>
      )}
      <p className="flex justify-center items-center my-4">
        <Separator className="shrink" />
        <span className="px-4 text-zinc-500 dark:text-zinc-500 text-sm">
          Or
        </span>
        <Separator className="shrink" />
      </p>
      <form onSubmit={handleGoogleOAuthRedirect}>
        <Button className="w-full">
          <FaGoogle /> Signup with Google
        </Button>
      </form>
      <p
        className={`text-center pt-4 ${isSubmitting && "text-zinc-900/50 dark:text-zinc-100/50"}`}
      >
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          className={
            isSubmitting
              ? "pointer-events-none cursor-not-allowed text-blue-600/50 dark:text-blue-500/50"
              : "hover:underline text-blue-600 dark:text-blue-500 cursor-pointer"
          }
        >
          Signin
        </Link>
      </p>
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request your college</DialogTitle>
            <DialogDescription>
              If your college is missing, send the details here and an admin can
              add it.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleRequestSubmit(onRequestCollegeSubmit)}
            className="space-y-4"
          >
            <Input
              placeholder="College name"
              disabled={isSubmittingRequest}
              {...registerRequest("name")}
            />
            {requestErrors.name && (
              <p className="text-red-500 text-sm mt-1!">
                {String(requestErrors.name.message)}
              </p>
            )}
            <Input
              placeholder="College email domain"
              disabled={isSubmittingRequest}
              {...registerRequest("emailDomain")}
            />
            {requestErrors.emailDomain && (
              <p className="text-red-500 text-sm mt-1!">
                {String(requestErrors.emailDomain.message)}
              </p>
            )}
            <Input
              placeholder="City"
              disabled={isSubmittingRequest}
              {...registerRequest("city")}
            />
            {requestErrors.city && (
              <p className="text-red-500 text-sm mt-1!">
                {String(requestErrors.city.message)}
              </p>
            )}
            <Input
              placeholder="State"
              disabled={isSubmittingRequest}
              {...registerRequest("state")}
            />
            {requestErrors.state && (
              <p className="text-red-500 text-sm mt-1!">
                {String(requestErrors.state.message)}
              </p>
            )}
            <Input
              placeholder="Your college email"
              disabled={isSubmittingRequest}
              {...registerRequest("requestedByEmail")}
            />
            {requestErrors.requestedByEmail && (
              <p className="text-red-500 text-sm mt-1!">
                {String(requestErrors.requestedByEmail.message)}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmittingRequest}
            >
              {isSubmittingRequest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending request
                </>
              ) : (
                "Submit request"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SignUpPage;

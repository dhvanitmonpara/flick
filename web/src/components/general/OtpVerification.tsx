import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

interface OtpVerificationProps {
  email: string;
  otp: string;
  onOtpChange: (otp: string) => void;
  onVerify: () => void;
  onResend: () => void;
  isLoading: boolean;
  isResending: boolean;
  timeLeft: number;
  attempts: number;
  maxAttempts: number;
  isOtpInvalid: boolean;
  title?: string;
  submitButtonText?: string;
  submittingButtonText?: string;
  className?: string;
  isDanger?: boolean;
}

export function OtpVerification({
  email,
  otp,
  onOtpChange,
  onVerify,
  onResend,
  isLoading,
  isResending,
  timeLeft,
  attempts,
  maxAttempts,
  isOtpInvalid,
  title = "Verify OTP",
  submitButtonText = "Verify Account",
  submittingButtonText = "Verifying...",
  className,
  isDanger = false,
}: OtpVerificationProps) {
  return (
    <div className={cn("max-w-md w-full mx-auto px-6 py-8 border dark:border-zinc-800 rounded-lg shadow-lg", className)}>
      <h1 className={cn("font-semibold mb-6 text-center", isDanger ? "text-2xl text-red-600" : "text-3xl")}>{title}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (otp.length === 6 && !isLoading && !isOtpInvalid) {
            onVerify();
          }
        }}
        className="space-y-5 flex justify-center items-center flex-col"
      >
        <p className="text-sm text-foreground/60 text-center">
          Enter the 6-digit code we emailed to <b>{email}</b>. If you did not
          receive it, you can request a new one{" "}
          {timeLeft > 0 ? (
            <span>
              in <b>{timeLeft}</b> seconds
            </span>
          ) : isResending ? (
            <span className="text-blue-500 inline-flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Resending...
            </span>
          ) : (
            <span
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={onResend}
            >
              Resend OTP
            </span>
          )}
          .
        </p>
        <InputOTP
          disabled={isLoading || timeLeft === 0 || attempts >= maxAttempts}
          maxLength={6}
          value={otp}
          onChange={onOtpChange}
        >
          <InputOTPGroup>
            <InputOTPSlot autoFocus index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        {attempts >= maxAttempts && (
          <p className="text-sm text-red-500 text-center">
            You have exceeded the maximum number of attempts. Please try again
            later.
          </p>
        )}
        {isOtpInvalid && (
          <p className="text-sm text-red-500 text-center">
            Invalid OTP. Please try again.
          </p>
        )}
        <Button
          type="submit"
          disabled={isLoading || otp.length !== 6 || !email || isOtpInvalid}
          className={cn(
            "w-full py-2 font-semibold rounded-md transition-colors disabled:bg-zinc-500 disabled:cursor-wait flex justify-center items-center gap-2",
            isDanger
              ? "bg-red-600 text-white hover:bg-red-700"
              : "dark:text-zinc-900 bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300"
          )}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? submittingButtonText : submitButtonText}
        </Button>
      </form>
    </div>
  );
}

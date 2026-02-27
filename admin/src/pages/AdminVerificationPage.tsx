import { useState, useEffect, useCallback } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from 'sonner'
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useProfileStore from "@/store/profileStore";
import { authClient } from "@/lib/auth-client";
import { hasAdminAccess } from "@/lib/roles";

const OTP_EXPIRE_TIME = 60;
const MAX_ATTEMPTS = 3;

const AdminVerificationPage = () => {
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRE_TIME);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const setProfile = useProfileStore(s => s.setProfile)

  const { email } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!email) {
      navigate("/auth/signin");
    }
  }, [navigate, email]);

  const handleOtpChange = (newOtp: string) => {
    setOtp(newOtp);
    if (isOtpInvalid) {
      setIsOtpInvalid(false);  // Clear error when user starts typing
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const sendOtp = useCallback(async () => {
    if (!email) navigate("/auth/signup")
    try {
      const res = await authClient.twoFactor.sendOtp();
      if (!res.error) {
        setTimeLeft(OTP_EXPIRE_TIME);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  }, [navigate, email])

  const handleResendOTP = () => {
    if (attempts >= MAX_ATTEMPTS) {
      toast.error("You have exceeded the maximum number of attempts.");
      return;
    }
    setTimeLeft(OTP_EXPIRE_TIME);
    sendOtp();
  };

  const verify = async () => {
    try {
      setIsLoading(true)

      if (!email) {
        navigate("/auth/signup")
        return
      }

      await authClient.twoFactor.verifyOtp({
        code: otp,
        fetchOptions: {
          onSuccess: async () => {
            toast.success("OTP verified successfully!");
            // Check session to get updated user data since verifyOtp doesn't return user directly
            const session = await authClient.getSession();
            if (session?.data?.user && hasAdminAccess(session.data.user.role)) {
              setProfile({ ...session.data.user, id: session.data.user.id } as any);
            } else {
              toast.error("Unauthorized. Admin access only.");
              await authClient.signOut();
              navigate("/auth/signin", { replace: true });
              return;
            }
            navigate(`/`);
          },
          onError: () => {
            toast.warning("wrong otp try again");
            setIsOtpInvalid(true)
            setAttempts((prev) => prev + 1);
          }
        }
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
    } finally {
      setIsLoading(false)
    }
  }

  // More scoped, avoids unnecessary triggers
  useEffect(() => {
    if (otp.length !== 6 || attempts >= MAX_ATTEMPTS) return;

    const timer = setTimeout(() => {
      verify();
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  return (
    <div className="max-w-md w-full mx-auto px-6 py-8 border dark:border-zinc-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-6 text-center">Sign Up</h1>
      <form className="space-y-5 flex justify-center items-center flex-col">
        <p className="text-sm text-foreground/60 text-center">
          Enter the 6-digit code we emailed to <b>{email}</b>. If you did not
          receive it, you can request a new one{" "}
          {timeLeft > 0 ? (
            <span>
              in <b>{timeLeft}</b> seconds
            </span>
          ) : (
            <span
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={handleResendOTP}
            >
              Resend OTP
            </span>
          )}
          .
        </p>
        <InputOTP disabled={isLoading || timeLeft === 0 || attempts >= MAX_ATTEMPTS} maxLength={6} value={otp} onChange={handleOtpChange}>
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
        {attempts >= MAX_ATTEMPTS && (
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
          className={`w-full py-2 font-semibold rounded-md dark:text-zinc-900 bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:bg-zinc-500 disabled:cursor-wait"}`}
        >
          {isLoading ? "Verifying..." : "Verify Account"}
        </Button>
      </form>
    </div>
  );
};

export default AdminVerificationPage;

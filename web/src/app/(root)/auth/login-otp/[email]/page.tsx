"use client"

import { useState, useEffect, useCallback } from "react";
import { AxiosError } from "axios";
import { toast } from 'sonner'
import { useParams, useRouter } from "next/navigation";
import { authApi } from "@/services/api/auth";
import { OtpVerification } from "@/components/general/OtpVerification";

const OTP_EXPIRE_TIME = 60;
const MAX_ATTEMPTS = 5;

const LoginOtpPage = () => {
  const onFailedRedirect = "/auth/signin";
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRE_TIME);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);

  const { email } = useParams()
  const decodedEmail = decodeURIComponent(email as string)
  const router = useRouter()

  useEffect(() => {
    if (!email) {
      router.push(onFailedRedirect);
    }
  }, [router, email]);

  const handleOtpChange = (newOtp: string) => {
    setOtp(newOtp);
    if (isOtpInvalid) setIsOtpInvalid(false);
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Send OTP on mount
  const sendOtp = useCallback(async () => {
    if (!email) return;
    try {
      setIsResending(true);
      const sent = await authApi.otp.sendLogin(decodedEmail);
      if (sent) {
        setTimeLeft(OTP_EXPIRE_TIME);
        toast.success("OTP sent to your email!");
      }
    } catch (error) {
      console.error("Error sending login OTP:", error);
      toast.error("Failed to send OTP");
    } finally {
      setIsResending(false);
    }
  }, [email, decodedEmail]);

  useEffect(() => {
    sendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async () => {
    try {
      setIsLoading(true);

      if (!email) {
        router.push(onFailedRedirect);
        return;
      }

      const isVerified = await authApi.otp.verifyLogin(decodedEmail, otp);

      if (isVerified) {
        toast.success("Logged in successfully!");
        router.push("/");
      } else {
        toast.error("Failed to verify OTP");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          toast.warning(error.response.data?.message || "Invalid OTP, try again");
          setIsOtpInvalid(true);
          setAttempts((prev) => prev + 1);
        } else {
          toast.error(error.response?.data?.message || "Failed to verify OTP");
        }
      } else {
        console.error("Error verifying OTP:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (otp.length !== 6 || attempts >= MAX_ATTEMPTS) return;

    const timer = setTimeout(() => {
      verify();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  return (
    <OtpVerification
      email={decodedEmail}
      otp={otp}
      onOtpChange={handleOtpChange}
      onVerify={verify}
      onResend={sendOtp}
      isLoading={isLoading}
      isResending={isResending}
      timeLeft={timeLeft}
      attempts={attempts}
      maxAttempts={MAX_ATTEMPTS}
      isOtpInvalid={isOtpInvalid}
      title="Sign In with OTP"
      submitButtonText="Verify & Login"
      submittingButtonText="Verifying..."
    />
  );
};

export default LoginOtpPage;

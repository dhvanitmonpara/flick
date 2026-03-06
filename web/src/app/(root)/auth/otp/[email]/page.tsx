"use client"

import { useState, useEffect, useCallback, useRef } from "react";
import { AxiosError } from "axios";
import { toast } from 'sonner'
import { useParams, useRouter } from "next/navigation";
import { authApi } from "@/services/api/auth";
import { OtpVerification } from "@/components/general/OtpVerification";

const OTP_EXPIRE_TIME = 60;
const MAX_ATTEMPTS = 5;

const OtpVerificationPage = () => {
  const onVerifiedRedirect = "/auth/setup";
  const onFailedRedirect = "/auth/signup";
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRE_TIME);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const isVerifiedRef = useRef(false);

  const { email } = useParams()
  const decodedEmail = decodeURIComponent(email as string)
  const navigate = useRouter().push

  useEffect(() => {
    if (!email) {
      navigate(onFailedRedirect);
    }
  }, [navigate, email, onFailedRedirect]);

  const handleOtpChange = (newOtp: string) => {
    setOtp(newOtp);
    if (isOtpInvalid) {
      setIsOtpInvalid(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const sendOtp = useCallback(async () => {
    if (!email) navigate(onFailedRedirect)
    try {
      setIsResending(true);
      const isMailSent = await authApi.otp.send(decodedEmail);

      if (isMailSent) {
        setTimeLeft(OTP_EXPIRE_TIME);
        toast.success("OTP sent successfully!");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  }, [email, navigate, onFailedRedirect, decodedEmail])

  const handleResendOTP = () => {
    if (attempts >= MAX_ATTEMPTS) {
      toast.error("You have exceeded the maximum number of attempts.");
      return;
    }
    sendOtp();
  };

  const verify = async () => {
    if (isVerifiedRef.current || isLoading) return
    
    try {
      isVerifiedRef.current = true
      setIsLoading(true)

      if (!email) {
        navigate(onFailedRedirect)
        return
      }

      const isVerified = await authApi.otp.verify(otp);

      if (!isVerified) {
        toast.error("failed to verify otp")
        isVerifiedRef.current = false
        return
      }

      if (isVerified) {
        toast.success("OTP verified successfully!");
        navigate(`${onVerifiedRedirect}/${decodedEmail}`);
      }
    } catch (error) {
      isVerifiedRef.current = false
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          toast.warning("wrong otp try again");
          setIsOtpInvalid(true)
          setAttempts((prev) => prev + 1);
        } else {
          toast.error(error.response?.data.message || "failed to verify otp")
        }
      } else {
        console.error("Error verifying OTP:", error);
      }
    } finally {
      setIsLoading(false)
    }
  }

  // More scoped, avoids unnecessary triggers
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
      onResend={handleResendOTP}
      isLoading={isLoading}
      isResending={isResending}
      timeLeft={timeLeft}
      attempts={attempts}
      maxAttempts={MAX_ATTEMPTS}
      isOtpInvalid={isOtpInvalid}
      title="Sign Up"
      submitButtonText="Verify Account"
      submittingButtonText="Verifying..."
    />
  );
};

export default OtpVerificationPage;

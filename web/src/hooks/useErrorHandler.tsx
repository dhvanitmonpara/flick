/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "@/config/env";
import useProfileStore from "@/store/profileStore";
import { User } from "@/types/User";
import axios, { AxiosError } from "axios";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

export const useErrorHandler = () => {
  const setProfile = useProfileStore((state) => state.setProfile);
  const removeProfile = useProfileStore((state) => state.removeProfile);

  const refreshPromiseRef = useRef<Promise<User> | null>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortController.current?.abort();
    };
  }, []);

  const refreshAccessToken = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const { data } = await axios.post(
          `${env.NEXT_PUBLIC_SERVER_API_ENDPOINT}/auth/refresh`,
          {},
          {
            withCredentials: true,
            signal,
          },
        );
        setProfile(data);
        return data;
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          removeProfile();
          throw new Error("Session invalid"); // Explicit signal for invalid refresh
        }
        throw error; // Retryable / network error, let it bubble
      }
    },
    [removeProfile, setProfile],
  );

  const getModerationMessage = (data?: Record<string, any>): string | null => {
    if (!data) return null;

    const code = String(data.code || "");
    const metaReasons = Array.isArray(data.meta?.reasons)
      ? data.meta.reasons.map(String)
      : [];
    const fieldReasons = Array.isArray(data.errors)
      ? data.errors.map((e: any) => String(e?.message || ""))
      : [];
    const reasons = [...metaReasons, ...fieldReasons].filter(Boolean);
    const reasonsText = reasons.join(" ").toUpperCase();

    const isModerationError =
      code === "CONTENT_MODERATION_VIOLATION" ||
      code === "CONTENT_POLICY_VIOLATION" ||
      /CONTENT VIOLATES MODERATION POLICY/i.test(String(data.message || ""));

    if (!isModerationError) return null;

    if (reasonsText.includes("SELF_HARM")) {
      return "We can’t allow content that encourages self-harm. If someone may be in immediate danger, please contact local emergency services right away.";
    }

    if (reasonsText.includes("BANNED_WORDS")) {
      return "Your message contains blocked language. Please rephrase and avoid masked spellings with symbols or numbers.";
    }

    if (
      reasonsText.includes("TOXICITY") ||
      reasonsText.includes("INSULT") ||
      reasonsText.includes("THREAT") ||
      reasonsText.includes("IDENTITY_ATTACK") ||
      reasonsText.includes("PROFANITY")
    ) {
      return "Your message may violate our safety policy (harassment, hate, threats, or abusive language). Please remove harmful content and try again.";
    }

    return "This message violates our content policy. Please edit and try again.";
  };

  const extractErrorMessage = (
    error: AxiosError | Error,
    fallback: string,
  ): string => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as Record<string, any> | undefined;
      const moderationMessage = getModerationMessage(data);
      if (moderationMessage) return moderationMessage;
      return data?.message || data?.error || error.message || fallback;
    }
    return error.message || fallback;
  };

  const reportError = (msg: string, setError?: (msg: string) => void) => {
    if (setError) setError(msg);
    else toast.error(msg);
  };

  const handleError = useCallback(
    async (
      error: AxiosError | Error,
      fallbackMessage: string,
      setError?: (errorMsg: string) => void,
      originalReq?: () => Promise<any>,
      refreshFailMessage = "Session expired, please log in again.",
      onError?: () => void,
      hasRetried = false,
    ): Promise<any> => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const code = error.response.data?.code;
        const shouldRefresh =
          error.response.data?.error === "Unauthorized" && !hasRetried;

        if (code === "INVALID_SESSION") {
          removeProfile();
          reportError("Session invalid. Please log in again.", setError);
          onError?.();
          return;
        }

        if (shouldRefresh && originalReq) {
          abortController.current = new AbortController();
          const { signal } = abortController.current;

          try {
            if (!refreshPromiseRef.current) {
              refreshPromiseRef.current = refreshAccessToken(signal).finally(
                () => {
                  refreshPromiseRef.current = null;
                },
              );
            }

            await refreshPromiseRef.current;

            return await originalReq();
          } catch (refreshError) {
            const msg = extractErrorMessage(
              refreshError as AxiosError,
              refreshFailMessage,
            );
            removeProfile();
            if (msg !== "Session invalid") reportError(msg, setError);
            onError?.();
            return;
          }
        } else {
          removeProfile();
          reportError(refreshFailMessage, setError);
          onError?.();
          return;
        }
      }

      const message = extractErrorMessage(error, fallbackMessage);
      reportError(message, setError);
      onError?.();
    },
    [refreshAccessToken, removeProfile],
  );

  return { handleError };
};

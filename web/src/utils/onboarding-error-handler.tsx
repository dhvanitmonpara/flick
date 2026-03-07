import { AxiosError } from "axios";

export const handleOnboardingError = async (
  error: unknown,
  navigate: (path: string) => void,
  authClient: any,
  removeProfile: () => void,
) => {
  if (error instanceof AxiosError) {
    if (error.response?.data.code === "USER_NOT_ONBOARDED") {
      const collegeId = error.response?.data?.meta?.collegeId;
      navigate(`/u/onboarding${collegeId ? `?collegeId=${collegeId}` : ""}`);
      return true;
    }

    if (error.response?.status === 401) {
      await authClient.signOut();
      removeProfile();
      return true;
    }
  }

  return false;
};

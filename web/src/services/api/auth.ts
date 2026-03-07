import { AxiosResponse } from "axios";
import { http } from "../http";

export interface UserProfile {
  id: string;
  username: string;
  collegeId: string;
  branch: string | null;
  status: string;
}

export const authApi = {
  me: async (): Promise<UserProfile> => {
    const response: AxiosResponse<{ user: UserProfile }> =
      await http.get("/auth/me");
    return response.data.user;
  },
  otp: {
    send: async (email: string) => {
      const mailResponse: AxiosResponse = await http.post("/auth/otp/send", {
        email,
      });
      return mailResponse.status === 200;
    },
    verify: async (otp: string) => {
      const verifyResponse: AxiosResponse = await http.post(
        "/auth/registration/verify-otp",
        { otp },
        { headers: { "Content-Type": "application/json" } },
      );
      return verifyResponse.status === 200;
    },
    sendForDeletion: async (email: string, authId: string) => {
      const mailResponse: AxiosResponse = await http.post("/auth/otp/send", {
        email,
        pending_signup: authId,
      });
      return mailResponse.status === 200;
    },
    verifyOnly: async (otp: string, authId: string) => {
      const verifyResponse: AxiosResponse = await http.post(
        "/auth/otp/verify",
        { otp, pending_signup: authId },
        { headers: { "Content-Type": "application/json" } },
      );
      return verifyResponse.status === 200;
    },
    sendLogin: async (email: string) => {
      const response: AxiosResponse = await http.post("/auth/otp/login/send", {
        email,
      });
      return response.status === 200;
    },
    verifyLogin: async (email: string, otp: string) => {
      const response: AxiosResponse = await http.post(
        "/auth/otp/login/verify",
        { email, otp },
      );
      return response.status === 200;
    },
  },
  password: {
    status: async (): Promise<{ hasPassword: boolean }> => {
      const response: AxiosResponse = await http.get("/auth/password/status");
      return { hasPassword: !!(response.data as any)?.hasPassword };
    },
    set: async (newPassword: string, currentPassword?: string) => {
      const response: AxiosResponse = await http.post("/auth/password/set", {
        newPassword,
        currentPassword,
      });
      return { success: response.status === 200 };
    },
  },
  resetPassword: {
    finalize: async (newPassword: string, token?: string) => {
      const resetResponse: AxiosResponse = await http.post(
        "/auth/password/reset",
        { newPassword, token },
      );
      return resetResponse.status === 200;
    },
    initialize: async (email: string, redirectTo?: string) => {
      const resetResponse: AxiosResponse = await http.post(
        "/auth/password/forgot",
        { email, redirectTo },
        { headers: { "Content-Type": "application/json" } },
      );
      return resetResponse.status === 200;
    },
  },
  oauth: {
    setup: async (email: string) => {
      const oauthResponse: AxiosResponse = await http.post(
        "/auth/registration/initialize",
        {
          email,
          password: "oauth-flow-placeholder",
        },
      );
      return oauthResponse.status === 201;
    },
  },
  register: {
    register: async (password: string) => {
      const response = await http.post(
        "/auth/registration/finalize",
        { password },
        { headers: { "Content-Type": "application/json" } },
      );
      return { success: response.status === 201, error: response.data?.error };
    },
    initialize: async (email: string, password: string) => {
      const response = await http.post(
        "/auth/registration/initialize",
        { email, password },
        { headers: { "Content-Type": "application/json" } },
      );
      return { success: response.status === 201, error: response.data?.error };
    },
  },
  onboarding: {
    complete: async (branch: string) => {
      const response = await http.post("/auth/onboarding/complete", { branch });
      return { success: response.status === 200, data: response.data };
    },
  },
  account: {
    delete: async () => {
      const response = await http.delete("/auth/account");
      return { success: response.status === 200, data: response.data };
    },
  },
  session: {
    login: async (email: string, password: string) => {
      const loginResponse: AxiosResponse = await http.post("/auth/login", {
        email,
        password,
      });
      return loginResponse.status === 200;
    },
    refresh: async () => {
      const refreshResponse: AxiosResponse = await http.post("/auth/refresh");
      return refreshResponse.status === 200;
    },
    logout: async () => {
      const logoutResponse: AxiosResponse = await http.post("/auth/logout");
      return logoutResponse.status === 200;
    },
    logoutAll: async () => {
      const logoutResponse: AxiosResponse = await http.post("/auth/logout-all");
      return logoutResponse.status === 200;
    },
  },
};

import { AxiosResponse } from "axios";
import { http } from "../http";

export const authApi = {
  otp: {
    send: async (email: string) => {
      const mailResponse: AxiosResponse = await http.post("/auth/otp/send", { email });
      return mailResponse.status === 200;
    },
    verify: async (otp: string) => {
      const verifyResponse: AxiosResponse = await http.post("/auth/registration/verify-otp", { otp }, { headers: { "Content-Type": "application/json" } });
      return verifyResponse.status === 200;
    },
  },
  resetPassword: {
    finalize: async (newPassword: string, token?: string) => {
      const resetResponse: AxiosResponse = await http.post("/auth/password/reset", { newPassword, token });
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
    setup: async (email: string, branch: string) => {
      const oauthResponse: AxiosResponse = await http.post("/auth/registration/initialize", {
        email,
        branch,
        password: "oauth-flow-placeholder",
      });
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
    initialize: async (email: string, password: string, branch: string) => {
      const response = await http.post(
        "/auth/registration/initialize",
        { email, password, branch },
        { headers: { "Content-Type": "application/json" } },
      );
      return { success: response.status === 201, error: response.data?.error };
    },
  },
  session: {
    login: async (email: string, password: string) => {
      const loginResponse: AxiosResponse = await http.post("/auth/login", { email, password });
      return loginResponse.status === 200;
    },
    refresh: async () => {
      const refreshResponse: AxiosResponse = await http.post("/auth/refresh");
      return refreshResponse.status === 200;
    },
    logoutAll: async () => {
      const logoutResponse: AxiosResponse = await http.post("/auth/logout-all");
      return logoutResponse.status === 200;
    },
  }
};

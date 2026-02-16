import { AxiosResponse } from "axios";
import { http } from "../http";

export const authApi = {
  otp: {
    send: async (email: string) => {
      const mailResponse: AxiosResponse = await http.post('/users/otp/send', { email: email });
      return mailResponse.status === 200;
    },
    verify: async (email: string, otp: string) => {
      const verifyResponse: AxiosResponse = await http.post('/users/otp/verify', { email: email, otp });
      return verifyResponse.status === 200;
    }
  },
  resetPassword: {
    finalize: async (email: string, password: string) => {
      const resetResponse: AxiosResponse = await http.post('/users/reset-password/init', { email: email, password: password });
      return resetResponse.status === 200;
    },
    initialize: async (email: string) => {
      const resetResponse: AxiosResponse = await http.post('/users/reset-password/establish', { email: email }, { headers: { "Content-Type": "application/json" } });
      return resetResponse.status === 200;
    },
  },
  oauth: {
    setup: async (email: string, branch: string) => {
      const oauthResponse: AxiosResponse = await http.post('/users/oauth', { email: email, branch: branch });
      return oauthResponse.status === 201;
    }
  },
  register: {
    register: async (email: string) => {
      const response = await http.post(
        '/users/register',
        { email },
        { headers: { "Content-Type": "application/json" } });
      return { success: response.status === 201, error: response.data?.error };
    },
    initialize: async (email: string, password: string, branch: string) => {
      const response = await http.post(
        '/users/initialize',
        { email, password, branch },
        { headers: { "Content-Type": "application/json" } });
      return { success: response.status === 201, error: response.data?.error };
    }
  },
  session: {
    login: async (email: string, password: string) => {
      const loginResponse: AxiosResponse = await http.post('/users/login', { email: email, password: password });
      return loginResponse.status === 200;
    },
  }
}

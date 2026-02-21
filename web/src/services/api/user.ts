import { http } from "../http";

export const userApi = {
  getMe: async () => {
    return http.get("/users/me");
  },
  getProfile: async () => {
    return http.get("/users/me");
  },
  acceptTerms: async () => {
    return http.post("/users/accept-terms", {});
  },
};

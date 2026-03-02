import { http } from "../http";

export const userApi = {
  getMe: async (options?: { signal?: AbortSignal; timeout?: number }) => {
    return http.get("/users/me", options);
  },
  getProfile: async (options?: { signal?: AbortSignal; timeout?: number }) => {
    return http.get("/users/me", options);
  },
  acceptTerms: async () => {
    return http.post("/users/accept-terms", {});
  },
  updateProfile: async (data: { branch: string }) => {
    return http.patch("/users/me", data);
  }
};

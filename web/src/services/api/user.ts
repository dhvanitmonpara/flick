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
  },
  blockUser: async (userId: string) => {
    return http.post(`/users/block/${userId}`, {});
  },
  unblockUser: async (userId: string) => {
    return http.post(`/users/unblock/${userId}`, {});
  },
  getBlockedUsers: async () => {
    return http.get("/users/blocked");
  },
};

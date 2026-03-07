import { http } from "../http";

export const notificationApi = {
  list: async () => {
    return http.get("/notifications/list");
  },
  markSeen: async (ids: string[]) => {
    return http.patch("/notifications/mark-seen", { ids });
  },
};

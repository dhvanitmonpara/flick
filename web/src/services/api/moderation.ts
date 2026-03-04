import { http } from "../http";

export const moderationApi = {
  getConfig: async () => {
    return http.get("/moderation/config");
  },
};

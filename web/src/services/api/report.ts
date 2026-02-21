import { http } from "../http";

export const reportApi = {
  create: async (payload: {
    targetId: string;
    type: string;
    reason: string;
    message: string;
  }) => {
    return http.post("/content-reports", payload);
  },
};

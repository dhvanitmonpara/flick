import { http } from "../http";

export const feedbackApi = {
  create: async (payload: { type: "bug" | "feedback"; title: string; content: string }) => {
    return http.post("/feedbacks", payload);
  },
};

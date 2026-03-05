import { rootHttp as http } from "../http";
import type { ApiResponse } from "@/types/api";

export type BannedWordSeverity = "mild" | "moderate" | "severe";

export type BannedWord = {
  id: string;
  word: string;
  strictMode: boolean;
  severity: BannedWordSeverity;
  createdAt: string;
  updatedAt: string;
};

export type ModerationWordPayload = {
  word: string;
  strictMode: boolean;
  severity: BannedWordSeverity;
};

export type ModerationWordUpdatePayload = Partial<ModerationWordPayload>;

export const moderationApi = {
  getConfig: async () => {
    const response = await http.get<ApiResponse<{ strictWords: string[]; normalWords: string[] }>>("/moderation/config");
    return response.data;
  },

  listWords: async () => {
    const response = await http.get<ApiResponse<{ words: BannedWord[] }>>("/moderation/words");
    return response.data;
  },

  createWord: async (payload: ModerationWordPayload) => {
    const response = await http.post<ApiResponse<{ word: BannedWord }>>("/moderation/words", payload);
    return response.data;
  },

  updateWord: async (id: string, payload: ModerationWordUpdatePayload) => {
    const response = await http.patch<ApiResponse<{ word: BannedWord }>>(`/moderation/words/${id}`, payload);
    return response.data;
  },

  deleteWord: async (id: string) => {
    const response = await http.delete<ApiResponse<{ word: BannedWord }>>(`/moderation/words/${id}`);
    return response.data;
  },
};

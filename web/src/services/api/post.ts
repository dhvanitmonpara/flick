import { http } from "../http";

type PostQuery = {
  branch?: string;
  topic?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "views";
  sortOrder?: "asc" | "desc";
  collegeId?: string;
};

export const postApi = {
  getPosts: async (params?: PostQuery) => {
    return http.get("/posts", { params });
  },
  getByCollege: async (collegeId: string) => {
    return http.get(`/posts/college/${collegeId}`);
  },
  getById: async (postId: string) => {
    return http.get(`/posts/${postId}`);
  },
  incrementView: async (postId: string) => {
    return http.post(`/posts/${postId}/view`, {});
  },
  create: async (payload: { title: string; content: string; topic: string; isPrivate?: boolean }) => {
    return http.post("/posts", payload, {
      headers: { "Content-Type": "application/json" },
    });
  },
  update: async (postId: string, payload: { title: string; content: string; topic: string; isPrivate?: boolean }) => {
    return http.patch(`/posts/${postId}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
  },
  remove: async (postId: string) => {
    return http.delete(`/posts/${postId}`);
  },
  getTrending: async () => {
    return http.get("/posts", {
      params: {
        sortBy: "views",
        sortOrder: "desc",
        limit: 5,
      },
    });
  },
};

import { http } from "../http";

export const commentApi = {
  getByPostId: async (postId: string) => {
    return http.get(`/comments/post/${postId}`);
  },
  create: async (postId: string, payload: { content: string; parentCommentId: string | null }) => {
    return http.post(`/comments/post/${postId}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
  },
  update: async (commentId: string, payload: { content: string }) => {
    return http.patch(`/comments/${commentId}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
  },
  remove: async (commentId: string) => {
    return http.delete(`/comments/${commentId}`);
  },
};

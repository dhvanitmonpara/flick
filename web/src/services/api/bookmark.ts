import { http } from "../http";

export const bookmarkApi = {
  listMine: async () => {
    return http.get("/bookmarks/user");
  },
  create: async (postId: string) => {
    return http.post("/bookmarks", { postId });
  },
  remove: async (postId: string) => {
    return http.delete(`/bookmarks/delete/${postId}`);
  },
};


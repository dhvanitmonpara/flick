import { Post } from "@/types/Post";
import { create } from "zustand";

interface PostState {
  posts: Post[] | null;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  removePost: (id: string) => void;
  updatePost: (id: string, updatedPost: Partial<Post>) => void;
}

const usePostStore = create<PostState>((set) => ({
  posts: null,
  setPosts: (posts) => set({ posts }),
  addPost: (post) =>
    set((state) => ({ posts: [...(state.posts || []), post] })),
  removePost: (id) =>
    set((state) => ({
      posts: state.posts?.filter((post) => post.id !== id),
    })),
  updatePost: (id, updatedPost) =>
    set((state) => ({
      posts: state.posts?.map((post) =>
        post.id === id ? { ...post, ...updatedPost } : post,
      ),
    })),
}));

export default usePostStore;

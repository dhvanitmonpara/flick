import { Comment } from "@/types/Comment";
import { create } from "zustand";

interface CommentState {
  comments: Comment[] | null;
  setComments: (comments: Comment[]) => void;
  removeComment: (id: string) => void;
  addComment: (comment: Comment) => void;
  resetComments: () => void;
  updateComment: (id: string, updatedPost: Partial<Comment>) => void;
}

const useCommentStore = create<CommentState>((set) => ({
  comments: null,
  resetComments: () => set({ comments: null }),
  setComments: (comments) => set({ comments }),
  removeComment: (id) =>
    set((state) => ({
      comments: state.comments?.filter((c) => c.id !== id),
    })),
  addComment: (comment) =>
    set((state) => ({
      comments: state.comments ? [...state.comments, comment] : [comment],
    })),
  updateComment: (id, updateComment) =>
    set((state) => ({
      comments: state.comments?.map((c) =>
        c.id === id ? { ...c, ...updateComment } : c,
      ),
    })),
}));

export default useCommentStore;

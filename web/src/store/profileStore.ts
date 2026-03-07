import { themeType } from "@/lib/types";
import { User } from "@/types/User";
import { create } from "zustand";

interface ProfileState {
  theme: themeType;
  profile: User;
  setProfile: (profile: User) => void;
  updateProfile: (updatedProfile: Partial<User>) => void;
  removeProfile: () => void;
  setTheme: (theme: themeType) => void;
}

const useProfileStore = create<ProfileState>((set) => ({
  theme: "light",
  profile: {
    id: "",
    branch: "",
    username: "",
    college: null,
  },
  setProfile: (profile) => set({ profile }),
  updateProfile: (updatedProfile) =>
    set((state) => ({
      profile: { ...state.profile, ...updatedProfile },
    })),
  removeProfile: () =>
    set({
      profile: {
        id: "",
        branch: "",
        username: "",
        college: null,
      },
    }),
  // inside profileStore.js
  setTheme: (theme) => {
    set(() => ({ theme }));
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  },
}));

export default useProfileStore;

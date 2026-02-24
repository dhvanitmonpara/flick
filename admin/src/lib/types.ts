type themeType = "light" | "dark";

type profileOptions = "profile" | "settings" | "feedback";

type User = {
  id: string;
  email?: string;
  name?: string;
  image?: string | null;
  role?: string;
};

export type {
  themeType,
  profileOptions,
  User,
};

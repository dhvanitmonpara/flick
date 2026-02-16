type themeType = "light" | "dark";

type profileOptions = "profile" | "settings" | "feedback";

type User = {
  _id: string;
  email?: string;
};

export type {
  themeType,
  profileOptions,
  User,
};

import { AuthSelect } from "@/shared/types/Auth";

export const toInternalAuth = (auth: AuthSelect) => ({
  id: auth.id,
  email: auth.email,
  emailVerified: auth.emailVerified,
  role: auth.role,
  isBanned: auth.banned &&
    (!auth.banExpires || auth.banExpires > new Date()),
});

export type InternalAuth = ReturnType<typeof toInternalAuth>;

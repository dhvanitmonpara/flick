import { betterAuth } from "better-auth";
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoVerifyEmail: true,
    autoSignInAfterResetPassword: true,
  }
});

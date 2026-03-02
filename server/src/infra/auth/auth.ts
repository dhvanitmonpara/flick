import db from "@/infra/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth"
import { twoFactor, admin } from "better-auth/plugins"
import { env } from "@/config/env";
import * as schema from "@/infra/db/tables";

export const auth = betterAuth({
  trustedOrigins: env.ACCESS_CONTROL_ORIGINS,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  user: {
    modelName: "auth",
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }) => {
        // Send delete account verification
      },
      afterDelete: async ({ id }) => {
        // const profile = await UserRepo.CachedRead.findByAuthId(id, {});
        // if (profile) {
        //   await UserRepo.Write.delete(profile.id);
        // }
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days cache duration
      strategy: "jwe", // can be "jwt" or "compact"
      refreshCache: true, // Enable stateless refresh
    },
  },
  account: {
    storeStateStrategy: "cookie",
    storeAccountCookie: true, // Store account data after OAuth flow in a cookie (useful for database-less flows)
  },
  plugins: [
    twoFactor(),
    admin(),
  ]
});
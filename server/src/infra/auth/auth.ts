import db from "@/infra/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth"
import { twoFactor, admin } from "better-auth/plugins"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    modelName: "auth_user",
    fields: {
      name: undefined,
      image: undefined,
    },
    additionalFields: {
      lookupEmail: {
        type: "string",
        required: true,
        fieldName: "lookup_email",
      },
      collegeId: {
        type: "string",
        required: true,
        fieldName: "college_id",
      },
      branch: {
        type: "string",
        required: true,
        fieldName: "branch",
      },
      karma: {
        type: "number",
        required: false,
        fieldName: "karma",
        defaultValue: 0
      },
      isAcceptedTerms: {
        type: "boolean",
        required: true,
        fieldName: "is_accepted_terms",
        defaultValue: false
      },
    }
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
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
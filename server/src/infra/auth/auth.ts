import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, twoFactor } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { env } from "@/config/env";
import db from "@/infra/db";
import * as schema from "@/infra/db/tables";
import { auth as authTable } from "@/infra/db/tables/auth.table";
import mailService from "@/infra/services/mail";

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
			// sendDeleteAccountVerification: async ({ user, url, token }) => {
			// Send delete account verification
			// },
			// afterDelete: async ({ id }) => {
			// const profile = await UserRepo.CachedRead.findByAuthId(id, {});
			// if (profile) {
			//   await UserRepo.Write.delete(profile.id);
			// }
			// },
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await mailService.send(user.email, "RESET-PASSWORD", {
				url,
				projectName: "Flick",
			});
		},
		onPasswordReset: async ({ user }) => {
			// Auto-verify the email on successful password reset.
			// This lets locked-out unverified users regain access by proving inbox ownership.
			if (!user.emailVerified) {
				await db
					.update(authTable)
					.set({ emailVerified: true })
					.where(eq(authTable.id, user.id));
			}
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_OAUTH_CLIENT_ID,
			clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
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
	plugins: [twoFactor(), admin()],
});

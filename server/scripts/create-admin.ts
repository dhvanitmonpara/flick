import { env } from "../src/config/env";
import { auth } from "../src/infra/auth/auth";
import AuthRepo from "../src/modules/auth/auth.repo";

async function createAdmin() {
	const email = env.ADMIN_EMAIL;
	const password = env.ADMIN_PASSWORD;

	let existing = await AuthRepo.Read.findByEmail(email);

	if (!existing) {
		await auth.api.signUpEmail({
			body: {
				name: "Admin",
				email,
				password,
				callbackURL: "/",
				rememberMe: false,
			},
		});

		existing = await AuthRepo.Read.findByEmail(email);
	}

	await AuthRepo.Write.update(existing.id, {
		role: "admin",
		emailVerified: true,
	});

	console.log("Admin ensured successfully");
}

createAdmin()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});

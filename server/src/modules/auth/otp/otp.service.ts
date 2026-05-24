import crypto from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { HttpError } from "@/core/http";
import db from "@/infra/db";
import { verification } from "@/infra/db/tables/auth.table";
import cache from "@/infra/services/cache/index";
import mailService from "@/infra/services/mail";
import CryptoTools from "@/lib/crypto-tools";

class OtpService {
	private readonly ttlSeconds = 900;

	private registrationOtpIdentifier(signupId: string) {
		return `otp:registration:${signupId}`;
	}

	private async saveRegistrationOtpHash(signupId: string, hashedOtp: string) {
		const identifier = this.registrationOtpIdentifier(signupId);
		const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000);

		await db.delete(verification).where(eq(verification.identifier, identifier));
		await db.insert(verification).values({
			id: crypto.randomUUID(),
			identifier,
			value: hashedOtp,
			expiresAt,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	}

	private async getRegistrationOtpHash(signupId: string) {
		const identifier = this.registrationOtpIdentifier(signupId);
		const now = new Date();

		const [row] = await db
			.select({ value: verification.value })
			.from(verification)
			.where(
				and(
					eq(verification.identifier, identifier),
					gt(verification.expiresAt, now),
				),
			)
			.limit(1);

		return row?.value ?? null;
	}

	private async deleteRegistrationOtp(signupId: string) {
		const identifier = this.registrationOtpIdentifier(signupId);
		await db.delete(verification).where(eq(verification.identifier, identifier));
	}

	async sendOtp(signupId: string, email: string) {
		const data = await mailService.send(email, "OTP", {
			username: email,
			projectName: "Flick",
		});

		if (data.status === "error" || !data?.otp) {
			throw HttpError.internal("OTP send failed");
		}

		const hashed = await CryptoTools.otp.hash(data.otp);
		await this.saveRegistrationOtpHash(signupId, hashed);

		// Best effort cache write for faster reads.
		await cache.set(`otp:${signupId}`, hashed, this.ttlSeconds);

		return { messageId: data.id };
	}

	async verifyOtp(signupId: string, otp: string) {
		const cached = await cache.get<string>(`otp:${signupId}`);
		const storedOtpHash = cached ?? (await this.getRegistrationOtpHash(signupId));
		if (!storedOtpHash) return false;

		const isMatch = await CryptoTools.otp.compare(otp, storedOtpHash);
		if (isMatch) {
			await cache.del(`otp:${signupId}`);
			await this.deleteRegistrationOtp(signupId);
		}

		return isMatch;
	}
}

export default new OtpService();

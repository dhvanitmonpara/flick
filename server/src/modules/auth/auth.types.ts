export type PendingUser = {
	readonly email: string;
	readonly collegeId: string;
	readonly branch: string;
	readonly fingerprint: string;
	readonly verifiedToken: string;
	readonly verified: boolean;
	readonly hashedOTP: string;
} | null;

import type { MailPayloadMap } from "./template.types";

export type MailType =
	| "OTP"
	| "WELCOME"
	| "FEEDBACK-RECEIVED"
	| "FEEDBACK-SENT"
	| "NEW-DEVICE-LOGIN"
	| "RESET-PASSWORD"
	| "COLLEGE-NOW-AVAILABLE";

export type MailDetails<T extends MailType = MailType> = MailPayloadMap[T];

export interface MailConfig {
	projectName?: string;
	defaultFrom?: string;
}

export interface MailTemplate {
	subject: string;
	html: string;
	text: string;
}

export type SendResult =
	| { status: "success"; id: string; otp?: string }
	| { status: "error"; error: string };

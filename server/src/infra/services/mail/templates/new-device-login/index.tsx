import { Button, Section, Text } from "@react-email/components";
import { env } from "@/config/env";
import BaseLayout from "../components/BaseLayout.js";

interface SessionInfo {
	id: string;
	device?: string;
	ipAddress?: string;
	createdAt: Date;
}

export default function NewDeviceLoginEmail({
	username,
	email,
	device,
	location,
	ipAddress,
	projectName,
	existingSessionId,
	allSessions,
}: {
	username: string;
	email: string;
	device: string;
	location?: string;
	ipAddress?: string;
	projectName: string;
	existingSessionId?: string;
	allSessions: SessionInfo[];
}) {
	const baseUrl =
		env.SERVER_BASE_URI || env.BETTER_AUTH_URL || "https://flick.college";
	const formattedDate = new Date().toLocaleString("en-US", {
		dateStyle: "long",
		timeStyle: "short",
		timeZone: "IST",
	});

	const terminateAllUrl = `${baseUrl}/api/auth/terminate-all-sessions?session=${existingSessionId}&email=${encodeURIComponent(email)}`;
	const resetPasswordUrl = `${baseUrl}/forgot-password`;

	return (
		<BaseLayout projectName={projectName}>
			<Section>
				<Text style={style.topText}>Hi {username},</Text>
				<Text style={style.text}>⚠️ New Device Login Detected</Text>
				<Text>
					We noticed a new sign-in to your account from an unrecognized device.
				</Text>
			</Section>

			<Section style={style.detailsBox}>
				<Text style={style.detailLabel}>
					<b>Device:</b> {device || "Unknown"}
				</Text>
				{location && (
					<Text style={style.detailLabel}>
						<b>Location:</b> {location}
					</Text>
				)}
				{ipAddress && (
					<Text style={style.detailLabel}>
						<b>IP Address:</b> {ipAddress}
					</Text>
				)}
				<Text style={style.detailLabel}>
					<b>Time:</b> {formattedDate}
				</Text>
			</Section>

			<Section style={style.sessionsBox}>
				<Text style={style.sectionTitle}>Your Active Sessions:</Text>
				{allSessions.map((session) => (
					<Text key={session.id} style={style.sessionText}>
						• {session.device || "Unknown Device"} -{" "}
						{session.createdAt.toLocaleDateString()}
						{session.id === existingSessionId ? " (this device)" : ""}
					</Text>
				))}
			</Section>

			<Section style={style.actionsBox}>
				<Text style={style.actionTitle}>Was this you?</Text>
				<Text style={style.actionText}>
					If this wasn't you, we recommend taking immediate action to secure
					your account:
				</Text>

				<Button href={terminateAllUrl} style={style.terminateButton}>
					Terminate All Other Sessions
				</Button>

				<Text style={style.orText}>or</Text>

				<Button href={resetPasswordUrl} style={style.resetButton}>
					Reset Password
				</Button>
			</Section>

			<Section>
				<Text style={style.helpText}>
					If you have any concerns, please contact support immediately.
				</Text>
			</Section>
		</BaseLayout>
	);
}

const style = {
	topText: { fontSize: "16px", fontWeight: "bold" as const },
	text: { fontSize: "18px", fontWeight: "bold" as const },
	detailsBox: {
		backgroundColor: "#f8f9fa",
		borderRadius: "8px",
		padding: "16px",
		marginTop: "12px",
	},
	detailLabel: {
		fontSize: "14px",
		marginBottom: "4px",
		color: "#333",
	},
	sessionsBox: {
		marginTop: "16px",
	},
	sectionTitle: {
		fontSize: "14px",
		fontWeight: "bold" as const,
		marginBottom: "8px",
	},
	sessionText: {
		fontSize: "13px",
		color: "#666",
		marginBottom: "4px",
	},
	actionsBox: {
		marginTop: "20px",
		textAlign: "center" as const,
	},
	actionTitle: {
		fontSize: "16px",
		fontWeight: "bold" as const,
		marginBottom: "8px",
	},
	actionText: {
		fontSize: "14px",
		color: "#666",
		marginBottom: "16px",
	},
	terminateButton: {
		backgroundColor: "#dc3545",
		color: "#ffffff",
		padding: "12px 24px",
		borderRadius: "6px",
		fontSize: "14px",
		fontWeight: "bold" as const,
		textDecoration: "none",
		display: "inline-block",
	},
	orText: {
		fontSize: "12px",
		color: "#999",
		margin: "12px 0",
	},
	resetButton: {
		backgroundColor: "#007bff",
		color: "#ffffff",
		padding: "12px 24px",
		borderRadius: "6px",
		fontSize: "14px",
		fontWeight: "bold" as const,
		textDecoration: "none",
		display: "inline-block",
	},
	helpText: {
		fontSize: "12px",
		color: "#999",
		marginTop: "16px",
	},
};

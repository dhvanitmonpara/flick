import { Section, Text } from "@react-email/components";
import BaseLayout from "../components/BaseLayout.js";

export default function WelcomeEmail({
	username,
	projectName,
	email,
	ipAddress,
	device,
	location,
	createdAt,
}: {
	username: string;
	projectName: string;
	email: string;
	ipAddress?: string;
	device?: string;
	location?: string;
	createdAt: Date;
}) {
	const formattedDate = createdAt.toLocaleString("en-US", {
		dateStyle: "long",
		timeStyle: "short",
		timeZone: "IST",
	});

	return (
		<BaseLayout projectName={projectName}>
			<Section>
				<Text style={style.topText}>Welcome, {username}!</Text>
				<Text>
					Thanks for joining {projectName}. We're excited to have you 🚀
				</Text>
			</Section>

			<Section style={style.warningBox}>
				<Text style={style.warningTitle}>Was this you?</Text>
				<Text style={style.warningText}>
					We noticed a new account was created with your email address.
				</Text>
				<Text style={style.detailText}>
					<b>Email:</b> {email}
				</Text>
				{device && (
					<Text style={style.detailText}>
						<b>Device:</b> {device}
					</Text>
				)}
				{location && (
					<Text style={style.detailText}>
						<b>Location:</b> {location}
					</Text>
				)}
				{ipAddress && (
					<Text style={style.detailText}>
						<b>IP Address:</b> {ipAddress}
					</Text>
				)}
				<Text style={style.detailText}>
					<b>Time:</b> {formattedDate}
				</Text>
			</Section>

			<Section>
				<Text style={style.helpText}>
					If this wasn't you, please reset your password immediately or contact
					support.
				</Text>
			</Section>
		</BaseLayout>
	);
}

const style = {
	topText: { fontSize: "18px", fontWeight: "bold" as const },
	warningBox: {
		backgroundColor: "#fff3cd",
		borderRadius: "8px",
		padding: "16px",
		marginTop: "16px",
		border: "1px solid #ffc107",
	},
	warningTitle: {
		fontSize: "16px",
		fontWeight: "bold" as const,
		color: "#856404",
		marginBottom: "8px",
	},
	warningText: {
		color: "#856404",
		fontSize: "14px",
		marginBottom: "12px",
	},
	detailText: {
		color: "#856404",
		fontSize: "13px",
		marginBottom: "4px",
	},
	helpText: {
		color: "#666",
		fontSize: "13px",
		marginTop: "16px",
	},
};

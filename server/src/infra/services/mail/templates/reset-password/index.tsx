import { Button, Section, Text } from "@react-email/components";
import React from "react";
import BaseLayout from "../components/BaseLayout.js";

void React;

export default function ResetPasswordEmail({
	url,
	projectName,
}: {
	url: string;
	projectName: string;
}) {
	return (
		<BaseLayout projectName={projectName}>
			<Section>
				<Text style={style.topText}>Reset your {projectName} password</Text>
				<Text>
					Someone recently requested a password change for your {projectName}{" "}
					account. If this was you, you can set a new password here:
				</Text>
				<Button href={url} style={style.button}>
					Reset Password
				</Button>
				<Text>
					If you don&apos;t want to change your password or didn&apos;t request
					this, just ignore and delete this message.
				</Text>
			</Section>
		</BaseLayout>
	);
}

const style = {
	topText: { fontSize: "18px", fontWeight: "bold" },
	button: {
		backgroundColor: "#000000",
		color: "#fff",
		padding: "12px 20px",
		borderRadius: "6px",
		textDecoration: "none",
		display: "inline-block",
		marginTop: "16px",
		marginBottom: "16px",
		fontWeight: "bold",
	},
};

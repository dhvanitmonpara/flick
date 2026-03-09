import { Section, Text } from "@react-email/components";
import BaseLayout from "../components/BaseLayout.js";

export default function CollegeNowAvailableEmail({
	projectName,
	collegeName,
}: {
	projectName: string;
	collegeName: string;
}) {
	return (
		<BaseLayout projectName={projectName}>
			<Section>
				<Text style={style.topText}>
					Your college is now available on Flick
				</Text>
				<Text>
					Good news. <strong>{collegeName}</strong> has been added to Flick and
					you can now continue signup using your college email.
				</Text>
			</Section>
		</BaseLayout>
	);
}

const style = {
	topText: { fontSize: "18px", fontWeight: "bold" },
};

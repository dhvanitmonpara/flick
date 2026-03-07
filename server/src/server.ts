import createApp from "@/app";
import { env } from "@/config/env";

const port = env.PORT;

const main = async () => {
	const app = createApp();
	const serverInstance = app.listen(port, () => {
		console.log(`Server is listening on port ${port}`);
	});

	serverInstance.on("error", (error) => {
		console.error("Server failed to start:", error);
		process.exit(1);
	});
};

main().catch((error) => {
	console.error("Server startup failed:", error);
	process.exit(1);
});

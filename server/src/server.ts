import createApp from "@/app";
import { env } from "@/config/env";

const port = env.PORT;
const host = env.NODE_ENV === "development" ? "localhost" : "0.0.0.0";

const main = async () => {
	const app = createApp();
	const serverInstance = app.listen(port, host, () => {
		console.log(`Server is listening on ${host}:${port}`);
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

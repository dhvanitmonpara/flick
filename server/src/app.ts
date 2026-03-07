import http from "node:http";
import cookieParser from "cookie-parser";
import express from "express";
import { errorHandlers, observeRequest } from "@/core/middlewares";
import socketService from "@/infra/services/socket";
import { registerRoutes } from "@/routes/index";
import applySecurity from "./config/security";
import { registerRequestLogging } from "./core/middlewares";

const createApp = () => {
	const app = express();
	const server = http.createServer(app);
	socketService.init(server);

	app.use(express.json({ limit: "16kb" }));
	app.use(express.urlencoded({ extended: true, limit: "16kb" }));
	app.use(express.static("public"));
	app.use(cookieParser());

	app.use(observeRequest);
	app.use(registerRequestLogging);

	applySecurity(app);
	registerRoutes(app);

	app.use(errorHandlers.notFound);
	app.use(errorHandlers.general);

	return server;
};

export default createApp;

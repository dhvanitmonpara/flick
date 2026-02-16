import winston from "winston";
import { env } from "@/config/env";
import { observabilityContext } from "@/modules/audit/audit-context";

const isDev = env.NODE_ENV === "development";

const addContext = winston.format((info) => {
  const ctx = observabilityContext.getStore();

  if (ctx) {
    info.request_id = ctx.requestId;
    info.ip = ctx.ip;
    info.user_agent = ctx.userAgent;
  }

  return info;
});

const logger = winston.createLogger({
  level: isDev ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    isDev
      ? winston.format.colorize({ all: true })
      : winston.format.uncolorize(),
    winston.format.printf((info: winston.Logform.TransformableInfo) => {
      const { timestamp, level, message, stack } = info;
      return stack
        ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`
        : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export default logger;

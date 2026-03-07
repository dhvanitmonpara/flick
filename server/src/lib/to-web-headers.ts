import type { IncomingHttpHeaders } from "node:http";

export function toWebHeaders(headers: IncomingHttpHeaders): Headers {
	return new Headers(
		Object.entries(headers).map(([key, value]) => [
			key,
			Array.isArray(value) ? value.join(",") : (value ?? ""),
		]),
	);
}

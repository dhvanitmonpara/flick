// utils/betterAuthHttpHelpers.ts
export function forwardSetCookieHeaders(
	fetchHeaders: Headers,
	res: import("express").Response,
) {
	if (typeof fetchHeaders.getSetCookie === "function") {
		const cookies = fetchHeaders.getSetCookie();
		if (cookies.length > 0) {
			res.setHeader("Set-Cookie", cookies);
		}
	} else {
		const setCookie = fetchHeaders.get("set-cookie");
		if (!setCookie) return;
		// fallback for environments without getSetCookie
		res.setHeader("Set-Cookie", setCookie);
	}
}

import crypto from "crypto";

export type TokenType = "access" | "refresh";

export type TokenPayload = {
	sub: string;
	type: TokenType;
	iat: number;
	exp: number;
	jti?: string;
};

function getSecret(): string {
	const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
	return secret;
}

function base64UrlEncode(input: Buffer | string): string {
	const buff = Buffer.isBuffer(input) ? input : Buffer.from(input);
	return buff
		.toString("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

function base64UrlDecode(input: string): Buffer {
	input = input.replace(/-/g, "+").replace(/_/g, "/");
	const pad = input.length % 4;
	if (pad) input += "=".repeat(4 - pad);
	return Buffer.from(input, "base64");
}

export function signToken(payload: TokenPayload): string {
	const header = { alg: "HS256", typ: "JWT" };
	const headerEncoded = base64UrlEncode(JSON.stringify(header));
	const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
	const data = `${headerEncoded}.${payloadEncoded}`;
	const hmac = crypto.createHmac("sha256", getSecret());
	hmac.update(data);
	const signature = base64UrlEncode(hmac.digest());
	return `${data}.${signature}`;
}

export type VerifyResult =
	| { ok: true; payload: TokenPayload }
	| { ok: false; error: "expired" | "invalid" };

export function verifyToken(token: string | undefined | null): VerifyResult {
	if (!token || typeof token !== "string") {
		return { ok: false, error: "invalid" };
	}
	const parts = token.split(".");
	if (parts.length !== 3) return { ok: false, error: "invalid" };
	const [headerEncoded, payloadEncoded, signature] = parts;
	const data = `${headerEncoded}.${payloadEncoded}`;
	const hmac = crypto.createHmac("sha256", getSecret());
	hmac.update(data);
	const expected = base64UrlEncode(hmac.digest());
	if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
		return { ok: false, error: "invalid" };
	}
	try {
		const payloadJson = base64UrlDecode(payloadEncoded).toString("utf-8");
		const payload: TokenPayload = JSON.parse(payloadJson);
		if (typeof payload.exp !== "number" || Date.now() / 1000 >= payload.exp) {
			return { ok: false, error: "expired" };
		}
		return { ok: true, payload };
	} catch {
		return { ok: false, error: "invalid" };
	}
}

export function issueAccessToken(userId: string, lifetimeSeconds = 60): string {
	const now = Math.floor(Date.now() / 1000);
	const payload: TokenPayload = {
		sub: userId,
		type: "access",
		iat: now,
		exp: now + lifetimeSeconds,
	};
	return signToken(payload);
}

export function issueRefreshToken(userId: string, lifetimeSeconds = 60 * 60 * 24 * 7): string {
	const now = Math.floor(Date.now() / 1000);
	const payload: TokenPayload = {
		sub: userId,
		type: "refresh",
		iat: now,
		exp: now + lifetimeSeconds,
		jti: crypto.randomBytes(16).toString("hex"),
	};
	return signToken(payload);
}

export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";
export const TOKEN_EXPIRED_HEADER = "x-access-token-expired";

export function getCookieOptions(maxAgeSeconds: number) {
	const isProd = process.env.NODE_ENV === "production";
	return {
		httpOnly: true as const,
		secure: isProd as const,
		sameSite: "lax" as const,
		path: "/",
		maxAge: maxAgeSeconds,
	};
}



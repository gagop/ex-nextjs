import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
	ACCESS_COOKIE,
	REFRESH_COOKIE,
	getCookieOptions,
	issueAccessToken,
	issueRefreshToken,
} from "../../../../lib/authTokens";

export const runtime = "nodejs";

const loginSchema = z.object({
	username: z.string().min(1),
	password: z.string().min(1),
});

export async function POST(request: NextRequest) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	}

	const { username, password } = parsed.data;
	const valid = username === "admin" && password === "admin123";
	if (!valid) {
		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	}

	// In a real app, userId would be the database user id
	const userId = "admin";
	const accessTtl = 30; // seconds (short for demo)
	const refreshTtl = 60 * 60 * 24 * 7; // 7 days

	const accessToken = issueAccessToken(userId, accessTtl);
	const refreshToken = issueRefreshToken(userId, refreshTtl);

	const res = NextResponse.json({ ok: true });
	res.cookies.set(ACCESS_COOKIE, accessToken, getCookieOptions(accessTtl));
	res.cookies.set(REFRESH_COOKIE, refreshToken, getCookieOptions(refreshTtl));
	return res;
}



import { NextRequest, NextResponse } from "next/server";
import {
	ACCESS_COOKIE,
	REFRESH_COOKIE,
	getCookieOptions,
	issueAccessToken,
	issueRefreshToken,
	verifyToken,
} from "../../../../lib/authTokens";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
	const verified = verifyToken(refresh);
	if (!verified.ok || verified.payload.type !== "refresh") {
		return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
	}

	const userId = verified.payload.sub;
	const accessTtl = 30;
	const refreshTtl = 60 * 60 * 24 * 7;

	const newAccess = issueAccessToken(userId, accessTtl);
	const newRefresh = issueRefreshToken(userId, refreshTtl);

	const res = NextResponse.json({ ok: true });
	res.cookies.set(ACCESS_COOKIE, newAccess, getCookieOptions(accessTtl));
	res.cookies.set(REFRESH_COOKIE, newRefresh, getCookieOptions(refreshTtl));
	return res;
}



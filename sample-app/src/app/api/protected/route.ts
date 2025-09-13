import { NextRequest, NextResponse } from "next/server";
import {
	ACCESS_COOKIE,
	TOKEN_EXPIRED_HEADER,
	verifyToken,
} from "../../../lib/authTokens";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
	const access = request.cookies.get(ACCESS_COOKIE)?.value;
	const verified = verifyToken(access);
	if (!verified.ok) {
		const res = NextResponse.json(
			{ error: verified.error === "expired" ? "Access token expired" : "Unauthorized" },
			{ status: 401 }
		);
		if (verified.error === "expired") {
			res.headers.set(TOKEN_EXPIRED_HEADER, "1");
		}
		return res;
	}

	return NextResponse.json({
		message: "Protected content",
		user: verified.payload.sub,
		time: new Date().toISOString(),
	});
}



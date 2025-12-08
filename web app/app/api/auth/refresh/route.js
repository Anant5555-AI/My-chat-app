import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongo";
import { createTokens, verifyRefreshToken } from "@/lib/auth/tokens";

export async function POST(request) {
  const { refreshToken } = await request.json();

  if (!refreshToken) {
    return NextResponse.json({ message: "Refresh token is required" }, { status: 400 });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const db = await getDb();
    const users = db.collection("users");
    const user = await users.findOne({ _id: new globalThis.ObjectId(payload.sub) });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const tokens = createTokens(user);

    return NextResponse.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    console.error("Refresh failed", error);
    return NextResponse.json({ message: "Invalid or expired refresh token" }, { status: 401 });
  }
}



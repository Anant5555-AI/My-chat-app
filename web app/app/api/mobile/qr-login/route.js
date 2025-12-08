import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import { getRedis } from "@/lib/db/redis";
import { createTokens } from "@/lib/auth/tokens";

export async function POST(request) {
  const { qrToken, mobilePublicKey } = await request.json();

  if (!qrToken) {
    return NextResponse.json({ message: "qrToken is required" }, { status: 400 });
  }

  const redis = getRedis();
  const key = `qr:${qrToken}`;
  const value = await redis.get(key);

  if (!value) {
    return NextResponse.json({ message: "Invalid or expired QR token" }, { status: 401 });
  }

  // Make token single-use
  await redis.del(key);

  const parsed = JSON.parse(value);
  const db = await getDb();
  const users = db.collection("users");

  const user = await users.findOne({ _id: new ObjectId(parsed.userId) });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Save Mobile Public Key
  if (mobilePublicKey) {
    await users.updateOne(
      { _id: user._id },
      { $set: { mobilePublicKey: mobilePublicKey } }
    );
  }

  const tokens = createTokens(user);

  return NextResponse.json({
    user: { id: user._id.toString(), email: user.email },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    otherPublicKey: user.webPublicKey || parsed.webPublicKey || null
  });
}



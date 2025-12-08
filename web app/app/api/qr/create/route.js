import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getRedis } from "@/lib/db/redis";
import { getDb } from "@/lib/db/mongo";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { ObjectId } from "mongodb";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice("Bearer ".length);

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  try {
    const { webPublicKey } = await request.json();

    const qrToken = randomUUID();
    const redis = getRedis();

    await redis.set(
      `qr:${qrToken}`,
      JSON.stringify({
        userId: payload.sub,
        webPublicKey: webPublicKey || null
      }),
      "EX",
      5 * 60 // 5 minutes
    );

    // Also persist Web Public Key to User Document for permanent retrieval
    if (webPublicKey) {
      const db = await getDb();
      await db.collection("users").updateOne(
        { _id: new ObjectId(payload.sub) },
        { $set: { webPublicKey: webPublicKey } }
      );
    }

    return NextResponse.json({ qrToken });
  } catch (e) {
    console.error("QR Create Error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}



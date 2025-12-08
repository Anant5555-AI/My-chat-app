import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongo";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { ObjectId } from "mongodb";

export async function GET(request) {
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

    const db = await getDb();
    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.sub) });

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
        webPublicKey: user.webPublicKey || null,
        mobilePublicKey: user.mobilePublicKey || null
    });
}

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongo";
import { verifyAccessToken } from "@/lib/auth/tokens";

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
    const chats = db.collection("chats");

    // Fetch the single document for this user which contains all messages
    const userChat = await chats.findOne({ userId: payload.sub });

    // If no chat history exists, return empty array
    const history = userChat?.messages || [];

    const formatted = history.map(m => ({
        id: m.id || m._id.toString(),
        content: m.content,
        senderId: m.senderId,
        createdAt: m.createdAt,
        ciphertext: m.ciphertext,
        iv: m.iv,
        authTag: m.authTag
    }));

    return NextResponse.json(formatted);
}

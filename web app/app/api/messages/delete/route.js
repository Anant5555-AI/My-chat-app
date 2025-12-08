import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongo";
import { verifyAccessToken } from "@/lib/auth/tokens";

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

    const { id } = await request.json();
    if (!id) {
        return NextResponse.json({ message: "Message ID required" }, { status: 400 });
    }

    const db = await getDb();
    const chats = db.collection("chats");

    // Only allow deleting own messages
    console.log(`[DELETE] Request for msg ${id} from user ${payload.sub}`);

    // Use $pull to remove the message with the matching id from the messages array
    const result = await chats.updateOne(
        { userId: payload.sub },
        { $pull: { messages: { id: id } } }
    );
    console.log(`[DELETE] Modified count: ${result.modifiedCount}`);

    if (result.modifiedCount === 0) {
        // Since we are using updateOne, modifiedCount 0 means either user doc not found or msg not found
        console.log(`[DELETE] Failed: Message not found or user has no chats.`);
        return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}

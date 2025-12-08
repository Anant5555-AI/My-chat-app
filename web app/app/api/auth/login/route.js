import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/mongo";
import { createTokens } from "@/lib/auth/tokens";

export async function POST(request) {
  const { email, password, publicKey } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  const db = await getDb();
  const users = db.collection("users");

  const user = await users.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  if (publicKey) {
    await users.updateOne({ _id: user._id }, { $set: { webPublicKey: publicKey } });
  }

  const tokens = createTokens(user);

  return NextResponse.json({
    user: { id: user._id.toString(), email: user.email },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    publicKey: user.webPublicKey || publicKey || null
  });
}


